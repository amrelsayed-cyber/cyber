# بيقرأ فولدر files/ (بأي عمق) ويكتب files-data.js اللي الموقع بيعرض منه الملفات.
# بيتشغّل تلقائي على GitHub مع كل رفع. ما تحتاجش تلمسه.
import os, json, re
ROOT = "files"
SKIP = {".DS_Store", "Thumbs.db", "desktop.ini", ".gitkeep"}

def nat(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]

def walk(path):
    out = []
    for name in sorted(os.listdir(path), key=nat):
        if name.startswith(".") or name in SKIP:
            continue
        p = os.path.join(path, name)
        if os.path.isdir(p):
            c = walk(p)
            if c:
                out.append({"n": name, "c": c})
        else:
            out.append({"n": name, "s": os.path.getsize(p)})
    return out

tree = walk(ROOT) if os.path.isdir(ROOT) else []
with open("files-data.js", "w", encoding="utf-8") as f:
    f.write("const FILES_TREE=" + json.dumps(tree, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("files-data.js written:", len(tree), "top-level folders")
