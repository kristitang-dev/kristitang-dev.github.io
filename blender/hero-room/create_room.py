"""Isometric blue-wood room: red chair, desk, laptop, bookcase, scrolling code wall.

Run:
  blender --background --python create_room.py
"""

import math
import os
import random

import bpy
from mathutils import Euler, Matrix, Vector

ROOT = os.path.dirname(os.path.abspath(__file__))
SEED = 11

# Floor top sits at TOP. Chunkier than real furniture so it matches the diorama.
TOP = 0.70

BLUE = "#2457DC"
BLUE_DARK = "#0C2A86"
BLUE_MID = "#163DA8"
GRID = "#E6EEFF"
RED = "#F01414"
WHITE = "#F4F7FF"
SILVER = "#D2D6DE"
KEY_DARK = "#1A1E26"
TRACK = "#2F62E4"


def log(msg):
    print(msg, flush=True)


def lin(u):
    return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4


def C(hex_color, a=1.0):
    h = hex_color.lstrip("#")
    rgb = [lin(int(h[i : i + 2], 16) / 255) for i in (0, 2, 4)]
    return (rgb[0], rgb[1], rgb[2], a)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def cube(name, loc, dim, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot, scale=dim)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.shade_flat()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return obj


def cylinder(name, loc, radius, depth, verts=56):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=loc
    )
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.shade_flat()
    return obj


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def box_uv(obj, scale=0.9):
    mesh = obj.data
    if mesh.uv_layers:
        uv_layer = mesh.uv_layers[0]
    else:
        uv_layer = mesh.uv_layers.new(name="UVMap")
    for poly in mesh.polygons:
        n = poly.normal
        ax, ay, az = abs(n.x), abs(n.y), abs(n.z)
        if az >= ax and az >= ay:
            i, j = 0, 1
        elif ax >= ay:
            i, j = 1, 2
        else:
            i, j = 0, 2
        for li in poly.loop_indices:
            co = mesh.vertices[mesh.loops[li].vertex_index].co
            uv_layer.data[li].uv = (co[i] * scale, co[j] * scale)


def face_materials(obj, side_mat, top_mat):
    mesh = obj.data
    mesh.materials.clear()
    mesh.materials.append(side_mat)
    mesh.materials.append(top_mat)
    for poly in mesh.polygons:
        poly.material_index = 1 if poly.normal.z > 0.55 else 0


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def cut_boolean(target, cutter):
    mod = target.modifiers.new("Cut", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = cutter
    mod.solver = "EXACT"
    bpy.ops.object.select_all(action="DESELECT")
    target.select_set(True)
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

def _wood_nodes(mat, grid):
    nt = mat.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (720, 0)
    diff = nodes.new("ShaderNodeBsdfDiffuse")
    diff.location = (480, 0)
    diff.inputs["Roughness"].default_value = 0.25
    links.new(diff.outputs["BSDF"], out.inputs["Surface"])

    coord = nodes.new("ShaderNodeTexCoord")
    coord.location = (-980, 0)

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-760, -180)
    noise.inputs["Scale"].default_value = 1.35
    noise.inputs["Detail"].default_value = 8.0
    noise.inputs["Roughness"].default_value = 0.55
    links.new(coord.outputs["UV"], noise.inputs["Vector"])

    dist = nodes.new("ShaderNodeMath")
    dist.operation = "MULTIPLY"
    dist.location = (-560, -220)
    dist.inputs[1].default_value = 16.0
    links.new(noise.outputs["Fac"], dist.inputs[0])

    wave = nodes.new("ShaderNodeTexWave")
    wave.location = (-360, 40)
    wave.wave_type = "BANDS"
    wave.bands_direction = "X"
    wave.inputs["Scale"].default_value = 2.4
    wave.inputs["Detail"].default_value = 2.0
    wave.inputs["Detail Scale"].default_value = 1.1
    links.new(coord.outputs["UV"], wave.inputs["Vector"])
    links.new(dist.outputs[0], wave.inputs["Distortion"])

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-120, 40)
    el = ramp.color_ramp.elements
    el[0].position = 0.0
    el[0].color = C(BLUE_DARK)
    el[1].position = 0.08
    el[1].color = C(BLUE)
    marks = (
        (0.46, BLUE),
        (0.52, BLUE_MID),
        (0.60, BLUE),
        (0.82, BLUE),
        (0.88, BLUE_DARK),
        (1.0, BLUE),
    )
    # elements[1] is already 0.08; move the last stop by adding new ones
    el[1].position = 0.10
    el[1].color = C(BLUE)
    for pos, hex_color in marks:
        e = el.new(pos)
        e.color = C(hex_color)
    links.new(wave.outputs["Fac"], ramp.inputs["Fac"])

    color_out = ramp.outputs["Color"]
    if grid:
        mask = _grid_mask(nodes, links, coord.outputs["UV"])
        mix = nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.location = (240, 80)
        links.new(mask, mix.inputs["Factor"])
        links.new(color_out, mix.inputs["A"])
        mix.inputs["B"].default_value = C(GRID)
        color_out = mix.outputs["Result"]

    links.new(color_out, diff.inputs["Color"])


def _grid_mask(nodes, links, uv_socket):
    sep = nodes.new("ShaderNodeSeparateXYZ")
    sep.location = (-760, 280)
    links.new(uv_socket, sep.inputs["Vector"])
    masks = []
    for idx, axis in enumerate(("X", "Y")):
        mul = nodes.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        mul.location = (-560, 360 - idx * 140)
        mul.inputs[1].default_value = 3.15
        links.new(sep.outputs[axis], mul.inputs[0])

        fract = nodes.new("ShaderNodeMath")
        fract.operation = "FRACT"
        fract.location = (-380, 360 - idx * 140)
        links.new(mul.outputs[0], fract.inputs[0])

        inv = nodes.new("ShaderNodeMath")
        inv.operation = "SUBTRACT"
        inv.location = (-380, 280 - idx * 140)
        inv.inputs[0].default_value = 1.0
        links.new(fract.outputs[0], inv.inputs[1])

        near = nodes.new("ShaderNodeMath")
        near.operation = "MINIMUM"
        near.location = (-200, 320 - idx * 140)
        links.new(fract.outputs[0], near.inputs[0])
        links.new(inv.outputs[0], near.inputs[1])

        line = nodes.new("ShaderNodeMath")
        line.operation = "LESS_THAN"
        line.location = (-20, 320 - idx * 140)
        line.inputs[1].default_value = 0.045
        links.new(near.outputs[0], line.inputs[0])
        masks.append(line.outputs[0])

    both = nodes.new("ShaderNodeMath")
    both.operation = "MAXIMUM"
    both.location = (160, 300)
    links.new(masks[0], both.inputs[0])
    links.new(masks[1], both.inputs[1])
    return both.outputs[0]


def make_wood(name, grid=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    _wood_nodes(mat, grid)
    return mat


def make_diffuse(name, hex_color, roughness=0.35):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    diff = nodes.new("ShaderNodeBsdfDiffuse")
    diff.inputs["Color"].default_value = C(hex_color)
    diff.inputs["Roughness"].default_value = roughness
    links.new(diff.outputs["BSDF"], out.inputs["Surface"])
    return mat


def make_metal(name, hex_color, roughness=0.28, metallic=0.85):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = C(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Specular IOR Level"].default_value = 0.35
    return mat


def new_image(name, w, h, buf):
    img = bpy.data.images.new(name, width=w, height=h, alpha=True)
    img.pixels.foreach_set(buf)
    img.pack()
    return img


FONT = {
    "0": ("01110", "10001", "10011", "10101", "11001", "10001", "01110"),
    "1": ("00100", "01100", "00100", "00100", "00100", "00100", "01110"),
    "{": ("00110", "00100", "01000", "01000", "01000", "00100", "00110"),
    "}": ("01100", "00100", "00010", "00010", "00010", "00100", "01100"),
    "(": ("00010", "00100", "01000", "01000", "01000", "00100", "00010"),
    ")": ("01000", "00100", "00010", "00010", "00010", "00100", "01000"),
    ";": ("00000", "00100", "00100", "00000", "00100", "01000", "00000"),
    "=": ("00000", "11111", "00000", "11111", "00000", "00000", "00000"),
    ">": ("10000", "01000", "00100", "00010", "00100", "01000", "10000"),
    "/": ("00001", "00010", "00100", "00100", "00100", "01000", "10000"),
    "+": ("00000", "00100", "00100", "11111", "00100", "00100", "00000"),
    "#": ("01010", "11111", "01010", "01010", "11111", "01010", "01010"),
}


def stamp(buf, w, h, glyph, x, y, scale, bright):
    gh = len(glyph)
    for row in range(gh):
        line = glyph[row]
        for col in range(len(line)):
            if line[col] != "1":
                continue
            for sy in range(scale):
                py = y + (gh - 1 - row) * scale + sy
                if py < 0 or py >= h:
                    continue
                for sx in range(scale):
                    px = x + col * scale + sx
                    if px < 0 or px >= w:
                        continue
                    i = (py * w + px) * 4
                    buf[i] = bright
                    buf[i + 1] = bright
                    buf[i + 2] = bright
                    buf[i + 3] = 1.0


def make_code_wall_image():
    rng = random.Random(SEED)
    w, h = 720, 780
    buf = [0.0] * (w * h * 4)
    cell_w, cell_h = 24, 26
    scale = 3
    cols = w // cell_w
    rows = h // cell_h
    symbols = ["{", "}", "(", ")", ";", "=", ">", "/", "+", "#"]
    for col in range(cols):
        density = 0.22 + 0.62 * (col / max(cols - 1, 1))
        row = 0
        while row < rows:
            if rng.random() > density:
                row += rng.randint(1, 3)
                continue
            run = rng.randint(3, 11)
            for i in range(run):
                if row >= rows:
                    break
                roll = rng.random()
                if roll < 0.9:
                    ch = "0" if rng.random() < 0.5 else "1"
                else:
                    ch = rng.choice(symbols)
                bright = 1.0 if i == run - 1 else rng.uniform(0.42, 0.92)
                stamp(
                    buf,
                    w,
                    h,
                    FONT[ch],
                    col * cell_w + 3,
                    row * cell_h + 2,
                    scale,
                    bright,
                )
                row += 1
            row += rng.randint(1, 4)
    img = new_image("CodeWall", w, h, buf)
    img.colorspace_settings.name = "Non-Color"
    return img


def make_screen_image():
    w, h = 640, 400
    buf = [0.0] * (w * h * 4)
    bg = (0.01, 0.014, 0.02, 1.0)
    fg = (0.95, 0.97, 1.0, 1.0)
    for i in range(0, len(buf), 4):
        buf[i : i + 4] = bg
    # Left-aligned strokes, a few indented, like a code editor at this scale.
    lines = [
        (0, 0.92),
        (0, 0.58),
        (1, 0.80),
        (1, 0.36),
        (1, 0.66),
        (2, 0.44),
        (0, 0.28),
        (0, 0.74),
        (0, 0.50),
    ]
    y = h - 36
    for indent, frac in lines:
        bh = 16
        x0 = 28 + indent * 28
        bw = int((w - 64) * frac)
        for yy in range(y, y + bh):
            if yy < 0 or yy >= h:
                continue
            for xx in range(x0, min(w - 20, x0 + bw)):
                i = (yy * w + xx) * 4
                buf[i : i + 4] = fg
        y -= 40
    img = new_image("LaptopScreen", w, h, buf)
    img.colorspace_settings.name = "sRGB"
    return img


def make_led_material(image):
    mat = bpy.data.materials.new("LedWall")
    mat.use_nodes = True
    nt = mat.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (980, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (700, 0)
    bsdf.inputs["Roughness"].default_value = 0.55
    bsdf.inputs["Specular IOR Level"].default_value = 0.15
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    coord = nodes.new("ShaderNodeTexCoord")
    coord.location = (-900, 0)
    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-680, 0)
    mapping.name = "Scroll"
    links.new(coord.outputs["UV"], mapping.inputs["Vector"])

    tex = nodes.new("ShaderNodeTexImage")
    tex.location = (-440, 80)
    tex.image = image
    tex.interpolation = "Closest"
    tex.extension = "REPEAT"
    links.new(mapping.outputs["Vector"], tex.inputs["Vector"])

    sep = nodes.new("ShaderNodeSeparateXYZ")
    sep.location = (-680, -280)
    links.new(coord.outputs["Object"], sep.inputs["Vector"])

    grad = nodes.new("ShaderNodeMapRange")
    grad.location = (-460, -280)
    grad.clamp = True
    grad.inputs["From Min"].default_value = -1.85
    grad.inputs["From Max"].default_value = 1.85
    links.new(sep.outputs["Z"], grad.inputs["Value"])

    bg = nodes.new("ShaderNodeMix")
    bg.data_type = "RGBA"
    bg.location = (-180, -260)
    links.new(grad.outputs["Result"], bg.inputs["Factor"])
    bg.inputs["A"].default_value = C("#F5F8FF")
    bg.inputs["B"].default_value = C("#2E66F0")

    glyph = nodes.new("ShaderNodeMix")
    glyph.data_type = "RGBA"
    glyph.location = (-180, -40)
    links.new(grad.outputs["Result"], glyph.inputs["Factor"])
    glyph.inputs["A"].default_value = C("#D5E3FF")
    glyph.inputs["B"].default_value = C("#FFFFFF")

    # Texture is a white-on-black mask. Bright heads are 1, dim digits are lower.
    final = nodes.new("ShaderNodeMix")
    final.data_type = "RGBA"
    final.location = (220, 40)
    links.new(tex.outputs["Color"], final.inputs["Factor"])
    links.new(bg.outputs["Result"], final.inputs["A"])
    links.new(glyph.outputs["Result"], final.inputs["B"])
    links.new(final.outputs["Result"], bsdf.inputs["Base Color"])
    links.new(glyph.outputs["Result"], bsdf.inputs["Emission Color"])

    # Glow follows the digits and fades toward the white bottom of the wall.
    mask = nodes.new("ShaderNodeSeparateColor")
    mask.location = (-180, 220)
    links.new(tex.outputs["Color"], mask.inputs["Color"])
    glow = nodes.new("ShaderNodeMath")
    glow.operation = "MULTIPLY"
    glow.location = (40, 220)
    links.new(mask.outputs["Red"], glow.inputs[0])
    links.new(grad.outputs["Result"], glow.inputs[1])
    glow_amt = nodes.new("ShaderNodeMath")
    glow_amt.operation = "MULTIPLY"
    glow_amt.location = (220, 220)
    glow_amt.inputs[1].default_value = 2.4
    links.new(glow.outputs[0], glow_amt.inputs[0])
    links.new(glow_amt.outputs[0], bsdf.inputs["Emission Strength"])

    drive_scroll(mapping)
    return mat


def drive_scroll(mapping):
    fc = mapping.inputs["Location"].driver_add("default_value", 1)
    drv = fc.driver
    drv.type = "SCRIPTED"
    var = drv.variables.new()
    var.name = "f"
    var.type = "SINGLE_PROP"
    tgt = var.targets[0]
    tgt.id_type = "SCENE"
    tgt.id = bpy.context.scene
    tgt.data_path = "frame_current"
    # One full loop every 96 frames. Negative Y scrolls the code upward.
    drv.expression = "-(f % 96) / 96.0"


def make_screen_material(image):
    mat = bpy.data.materials.new("Screen")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = image
    tex.interpolation = "Closest"
    links = mat.node_tree.links
    links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 2.2
    bsdf.inputs["Roughness"].default_value = 0.35
    bsdf.inputs["Specular IOR Level"].default_value = 0.2
    return mat


# ---------------------------------------------------------------------------
# Scene pieces
# ---------------------------------------------------------------------------

def build_floor(side_mat, top_mat):
    floor = cube("Floor", (0.05, 0.15, TOP / 2), (5.5, 4.5, TOP))
    # Front-right notch, so the separate wing reads as its own slab.
    notch = cube("Notch", (2.05, -1.45, TOP / 2), (1.7, 1.5, TOP + 0.4))
    cut_boolean(floor, notch)
    # Triangular opening fully inside the front slab, point facing +X.
    bpy.ops.mesh.primitive_cone_add(
        vertices=3,
        radius1=0.82,
        radius2=0.82,
        depth=TOP + 0.5,
        location=(-1.25, -0.85, TOP / 2),
        rotation=(0, 0, math.radians(-90)),
    )
    hole = bpy.context.active_object
    hole.name = "Hole"
    cut_boolean(floor, hole)
    box_uv(floor)
    face_materials(floor, side_mat, top_mat)

    wing_t = 0.46
    wing = cube("FloorWing", (3.45, -2.15, TOP - wing_t / 2), (1.7, 1.15, wing_t))
    box_uv(wing)
    face_materials(wing, side_mat, top_mat)
    return floor, wing


def build_backdrop():
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=1.15,
        depth=0.04,
        location=(-3.15, 1.35, TOP + 1.55),
        rotation=(math.radians(90), 0, math.radians(18)),
    )
    disc = bpy.context.active_object
    disc.name = "BackdropDisc"
    disc.scale = (1.15, 1.15, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    assign(disc, make_diffuse("Backdrop", WHITE, 0.8))
    return disc


def build_bookcase(origin, size, mat, book_mats):
    ox, oy, oz = origin
    w, d, h = size
    t = 0.06
    parts = [
        cube("BookcaseSideL", (ox - w / 2 + t / 2, oy, oz + h / 2), (t, d, h)),
        cube("BookcaseSideR", (ox + w / 2 - t / 2, oy, oz + h / 2), (t, d, h)),
        cube("BookcaseTop", (ox, oy, oz + h - t / 2), (w, d, t)),
        cube("BookcaseBottom", (ox, oy, oz + t / 2), (w, d, t)),
        cube("BookcaseBack", (ox, oy + d / 2 - t / 2, oz + h / 2), (w - 2 * t, t, h - 2 * t)),
    ]
    n_shelves = 4
    inner_h = h - 2 * t
    shelf_tops = []
    for i in range(n_shelves):
        z_center = oz + t + inner_h * (i + 1) / (n_shelves + 1)
        shelf = cube(
            f"BookcaseShelf.{i}",
            (ox, oy - 0.01, z_center),
            (w - 2 * t, d - t, 0.045),
        )
        parts.append(shelf)
        shelf_tops.append(z_center + 0.0225)
    shelf_tops.insert(0, oz + t)
    for part in parts:
        box_uv(part)
        assign(part, mat)

    rng = random.Random(SEED + 3)
    inner_left = ox - w / 2 + t + 0.02
    inner_right = ox + w / 2 - t - 0.02
    for zi, z in enumerate(shelf_tops):
        x = inner_left
        while x < inner_right - 0.05:
            bw = rng.choice((0.05, 0.06, 0.075, 0.09))
            bh = rng.uniform(0.24, 0.36)
            if zi == len(shelf_tops) - 1:
                bh = min(bh, 0.30)
            if x + bw > inner_right:
                break
            book = cube(
                "Book",
                (x + bw / 2, oy - 0.02, z + bh / 2),
                (bw, d * 0.62, bh),
            )
            assign(book, rng.choice(book_mats))
            x += bw + rng.choice((0.006, 0.01, 0.014))


def build_desk(loc, dim, side_mat, top_mat):
    desk = cube("Desk", loc, dim)
    box_uv(desk)
    face_materials(desk, side_mat, top_mat)
    return desk


def build_chair(origin, mat):
    x, y, z = origin
    leg = 0.045
    seat_w, seat_d, seat_t = 0.50, 0.48, 0.05
    leg_h = 0.46
    inset = 0.04
    parts = []
    for sx in (-1, 1):
        for sy in (-1, 1):
            lx = x + sx * (seat_w / 2 - inset)
            ly = y + sy * (seat_d / 2 - inset)
            parts.append(cube("ChairLeg", (lx, ly, z + leg_h / 2), (leg, leg, leg_h)))
    parts.append(cube("ChairSeat", (x, y, z + leg_h + seat_t / 2), (seat_w, seat_d, seat_t)))
    back_h = 0.42
    back_z = z + leg_h + seat_t + back_h / 2
    parts.append(
        cube(
            "ChairBack",
            (x, y + seat_d / 2 - leg / 2, back_z),
            (seat_w, leg, back_h),
        )
    )
    for part in parts:
        assign(part, mat)


def align_z_to(normal):
    """Rotation whose local +Z matches `normal`, local +X stays along world X."""
    z_axis = normal.normalized()
    x_axis = Vector((1.0, 0.0, 0.0))
    y_axis = z_axis.cross(x_axis).normalized()
    x_axis = y_axis.cross(z_axis).normalized()
    return Matrix((x_axis, y_axis, z_axis)).transposed().to_euler()


def build_laptop(center, desk_top, mats):
    bw, bd, bt = 0.74, 0.50, 0.028
    base_z = desk_top + 0.012 + bt / 2
    base = cube("LaptopBase", (center[0], center[1], base_z), (bw, bd, bt))
    assign(base, mats["silver"])

    keys = cube(
        "LaptopKeyboard",
        (center[0], center[1] + 0.045, base_z + bt / 2 + 0.003),
        (bw * 0.84, bd * 0.46, 0.005),
    )
    assign(keys, mats["keys"])

    pad = cube(
        "LaptopTrackpad",
        (center[0], center[1] - bd * 0.28, base_z + bt / 2 + 0.003),
        (0.16, 0.11, 0.005),
    )
    assign(pad, mats["track"])

    sw, sh, st = 0.74, 0.48, 0.016
    # Negative X leans the lid back so the display faces up toward the camera.
    tilt = Euler((math.radians(-34), 0, 0), "XYZ")
    hinge = Vector((center[0], center[1] + bd / 2 - 0.01, base_z + bt / 2))
    screen_center = hinge + tilt.to_matrix() @ Vector((0, 0, sh / 2))
    screen = cube("LaptopScreen", screen_center, (sw, st, sh), rot=tilt)
    assign(screen, mats["bezel"])

    normal = tilt.to_matrix() @ Vector((0, -1, 0))
    content_center = screen_center + normal * (st / 2 + 0.006)
    bpy.ops.mesh.primitive_plane_add(size=1, location=content_center, rotation=align_z_to(normal))
    content = bpy.context.active_object
    content.name = "LaptopScreenContent"
    content.scale = (sw * 0.88, sh * 0.80, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(content, mats["screen"])


def build_wall(center, dim, mat):
    wall = cube("LedWall", center, dim)
    # 0-1 UV on the face that points toward the camera (-Y), pixels kept square
    # enough by the texture aspect matching the wall.
    mesh = wall.data
    uv_layer = mesh.uv_layers.new(name="UVMap") if not mesh.uv_layers else mesh.uv_layers[0]
    faces = [p for p in mesh.polygons if p.normal.y < -0.5]
    xs, zs = [], []
    for poly in faces:
        for li in poly.loop_indices:
            co = mesh.vertices[mesh.loops[li].vertex_index].co
            xs.append(co.x)
            zs.append(co.z)
    minx, maxx = min(xs), max(xs)
    minz, maxz = min(zs), max(zs)
    for poly in faces:
        for li in poly.loop_indices:
            co = mesh.vertices[mesh.loops[li].vertex_index].co
            u = (co.x - minx) / (maxx - minx or 1)
            v = (co.z - minz) / (maxz - minz or 1)
            uv_layer.data[li].uv = (u, v)
    assign(wall, mat)
    return wall


def add_sun(name, location, target, energy, angle_deg=4):
    light = bpy.data.lights.new(name, "SUN")
    light.energy = energy
    light.angle = math.radians(angle_deg)
    light.color = (1.0, 0.985, 0.96)
    obj = bpy.data.objects.new(name, light)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    look_at(obj, target)
    return obj


def add_camera(target):
    cam_data = bpy.data.cameras.new("Camera")
    cam_data.type = "ORTHO"
    cam_data.sensor_fit = "VERTICAL"
    cam_data.clip_start = 0.01
    cam_data.clip_end = 200
    cam = bpy.data.objects.new("Camera", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    dist = 22
    offset = Vector((1, -1, 1)).normalized() * dist
    cam.location = Vector(target) + offset
    look_at(cam, target)
    bpy.context.scene.camera = cam
    return cam


def frame_camera(cam, margin=1.2):
    bpy.context.view_layer.update()
    inv = cam.matrix_world.inverted()
    pts = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or obj.hide_render:
            continue
        for corner in obj.bound_box:
            pts.append(inv @ (obj.matrix_world @ Vector(corner)))
    minx = min(p.x for p in pts)
    maxx = max(p.x for p in pts)
    miny = min(p.y for p in pts)
    maxy = max(p.y for p in pts)
    cx = (minx + maxx) / 2
    cy = (miny + maxy) / 2
    cam.location = cam.location + cam.matrix_world.to_quaternion() @ Vector((cx, cy, 0))
    aspect = (
        bpy.context.scene.render.resolution_x / bpy.context.scene.render.resolution_y
    )
    span_x = (maxx - minx) * margin
    span_y = (maxy - miny) * margin
    cam.data.ortho_scale = max(span_y, span_x / aspect)
    log(f"ortho_scale {cam.data.ortho_scale:.3f}")


def configure_render():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.eevee.taa_render_samples = 48
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 1600
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.dither_intensity = 0.4
    scene.render.image_settings.file_format = "PNG"
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 96
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    world = bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0, 0, 0, 1)
    bg.inputs[1].default_value = 1.0


def polish_viewport():
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type != "VIEW_3D":
                continue
            space = area.spaces[0]
            space.shading.type = "MATERIAL"
            space.shading.use_scene_lights_render = True
            space.region_3d.view_perspective = "CAMERA"


def main():
    log(f"Blender {bpy.app.version_string}")
    clear_scene()
    configure_render()

    side = make_wood("BlueWood", grid=False)
    top = make_wood("BlueWoodGrid", grid=True)
    red = make_diffuse("RedChair", RED, 0.3)
    white = make_diffuse("WhiteDisc", WHITE, 0.6)
    book_mats = [
        make_diffuse(f"BookColor.{i}", hex_color)
        for i, hex_color in enumerate(
            ("#F7F4EE", "#D5DFF5", "#8EAAE8", "#1C3E9A", "#E8EEF8", "#4E74D0", "#C9D4EA")
        )
    ]

    log("geometry")
    build_floor(side, top)
    build_backdrop()

    desk_dim = (2.25, 1.18, 0.92)
    desk_loc = (0.72, 0.95, TOP + desk_dim[2] / 2)
    build_desk(desk_loc, desk_dim, side, top)
    desk_top = TOP + desk_dim[2]

    build_bookcase((-1.72, 0.72, TOP), (1.12, 0.50, 2.25), side, book_mats)

    chair_xy = (0.28, -0.35)
    disc = cylinder("DiscChair", (chair_xy[0], chair_xy[1], TOP + 0.008), 0.46, 0.016)
    assign(disc, white)
    build_chair((chair_xy[0], chair_xy[1], TOP + 0.016), red)

    laptop_xy = (1.05, 1.02)
    laptop_disc = cylinder(
        "DiscLaptop", (laptop_xy[0], laptop_xy[1], desk_top + 0.006), 0.52, 0.012
    )
    assign(laptop_disc, white)

    log("textures")
    screen_mat = make_screen_material(make_screen_image())
    led_mat = make_led_material(make_code_wall_image())
    build_laptop(
        laptop_xy,
        desk_top + 0.012,
        {
            "silver": make_metal("LaptopBody", SILVER, 0.32, 0.75),
            "keys": make_diffuse("Keys", KEY_DARK, 0.5),
            "track": make_diffuse("Trackpad", TRACK, 0.4),
            "bezel": make_metal("Bezel", "#C5CAD3", 0.35, 0.7),
            "screen": screen_mat,
        },
    )

    wall_dim = (3.45, 0.07, 3.70)
    wall_center = (1.05, 2.18, TOP + wall_dim[2] / 2)
    build_wall(wall_center, wall_dim, led_mat)

    target = (0.35, 0.15, 1.35)
    add_sun("Key", (7.5, -6.5, 9.5), target, 4.2, 3.5)
    add_sun("Fill", (-7.0, -4.5, 6.0), target, 2.0, 8)
    add_sun("Top", (0.2, 0.4, 12.0), target, 1.3, 12)

    cam = add_camera(target)
    frame_camera(cam, margin=1.16)
    polish_viewport()

    note = bpy.data.texts.new("README")
    note.write(
        "Hero room diorama.\n"
        "Press Space to play: the wall code scrolls upward and loops every 96 frames.\n"
        "Camera is orthographic isometric. World background is black.\n"
    )

    blend_path = os.path.join(ROOT, "hero-room.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    log(f"saved {blend_path}")

    scene = bpy.context.scene
    for frame, filename in ((1, "preview.png"), (60, "preview_scroll.png")):
        scene.frame_set(frame)
        scene.render.filepath = os.path.join(ROOT, filename)
        log(f"rendering {filename}")
        bpy.ops.render.render(write_still=True)
        log(f"wrote {scene.render.filepath}")


if __name__ == "__main__":
    main()
