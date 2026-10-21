"""Export the hero room to a web glTF file. Does not save the blend."""

import os

import bpy

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
OUT_DIR = os.path.join(REPO, "public", "models")
os.makedirs(OUT_DIR, exist_ok=True)


def diffuse_to_principled(mat):
    """glTF export keeps Principled colors and images, and drops Diffuse BSDFs."""
    nt = mat.node_tree
    if nt is None:
        return
    diffuse = next((n for n in nt.nodes if n.type == "BSDF_DIFFUSE"), None)
    output = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
    if diffuse is None or output is None:
        return
    if any(n.type == "BSDF_PRINCIPLED" for n in nt.nodes):
        return
    principled = nt.nodes.new("ShaderNodeBsdfPrincipled")
    color = diffuse.inputs["Color"]
    if color.is_linked:
        nt.links.new(color.links[0].from_socket, principled.inputs["Base Color"])
    else:
        principled.inputs["Base Color"].default_value = tuple(color.default_value)
    principled.inputs["Roughness"].default_value = 0.9
    principled.inputs["Metallic"].default_value = 0.0
    for link in list(output.inputs["Surface"].links):
        nt.links.remove(link)
    nt.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    print(f"converted {mat.name}", flush=True)


for mat in bpy.data.materials:
    diffuse_to_principled(mat)


def box_map_uvs(obj, scale=0.55):
    """Tile the texture across each face in world space. glTF cannot do sphere projection."""
    mesh = obj.data
    if not mesh.uv_layers:
        mesh.uv_layers.new(name="UVMap")
    layer = mesh.uv_layers.active
    layer.active_render = True
    world = obj.matrix_world
    for poly in mesh.polygons:
        normal = world.to_3x3() @ poly.normal
        ax, ay, az = abs(normal.x), abs(normal.y), abs(normal.z)
        if az >= ax and az >= ay:
            axes = (0, 1)
        elif ax >= ay:
            axes = (1, 2)
        else:
            axes = (0, 2)
        for li in poly.loop_indices:
            co = world @ mesh.vertices[mesh.loops[li].vertex_index].co
            layer.data[li].uv = (co[axes[0]] * scale, co[axes[1]] * scale)


def flatten_projected_textures():
    """Sphere projection never leaves Blender. Retile those meshes and sample the image with UVs."""
    names = []
    for mat in bpy.data.materials:
        if mat.node_tree is None:
            continue
        for node in mat.node_tree.nodes:
            if node.type == "TEX_IMAGE" and node.projection != "FLAT" and node.image:
                node.projection = "FLAT"
                names.append(mat.name)
                print(f"flattened {mat.name} -> {node.image.name}", flush=True)
                break
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        if not any(slot.material and slot.material.name in names for slot in obj.material_slots):
            continue
        box_map_uvs(obj)
        print(f"box-mapped {obj.name}", flush=True)


flatten_projected_textures()

# The desk props imported from another file are far denser than they need to be
# at hero size. Decimate only for this export.
for obj in bpy.data.objects:
    if obj.type != "MESH" or len(obj.data.vertices) < 8000:
        continue
    mod = obj.modifiers.new("WebDecimate", "DECIMATE")
    mod.ratio = 0.04
    print(f"decimate {obj.name} {len(obj.data.vertices)} verts", flush=True)

code = bpy.data.images.get("CodeWall")
if code is not None:
    code.filepath_raw = os.path.join(OUT_DIR, "code-wall.png")
    code.file_format = "PNG"
    code.save()
    print("saved code-wall.png", flush=True)

out = os.path.join(OUT_DIR, "hero-room.glb")
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format="GLB",
    export_apply=True,
    export_cameras=True,
    export_lights=True,
    export_yup=True,
    export_texcoords=True,
    export_materials="EXPORT",
    export_image_format="AUTO",
)
print("wrote", out, os.path.getsize(out), flush=True)
