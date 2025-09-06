import os
import sys
import zipfile
import datetime
import posixpath

# 生成するZIP名
stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M')
zip_name = f"site-deploy-{stamp}.zip"

# このスクリプトのあるディレクトリをルートとする
root = os.path.abspath(os.path.dirname(__file__))

# ZIPに含めるトップレベル項目
INCLUDE_FILES = [
    'index.html',
    'guide.html',
    'events.html',
    'museum.html',
    'contact.html',
    'styles.css',
    'script.js',
    'netlify.toml',
]
INCLUDE_DIRS = [
    'images',
]

# 検証: 必要ファイル/フォルダの存在をチェック
missing = []
for f in INCLUDE_FILES:
    if not os.path.exists(os.path.join(root, f)):
        missing.append(f)
for d in INCLUDE_DIRS:
    if not os.path.isdir(os.path.join(root, d)):
        missing.append(d + '/ (directory)')

if missing:
    sys.stderr.write('Missing required items:\n' + '\n'.join(' - ' + m for m in missing) + '\n')
    sys.exit(1)

# ZIP作成
with zipfile.ZipFile(os.path.join(root, zip_name), 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    # ファイルを追加（arcnameは必ずPOSIXのスラッシュ）
    for f in INCLUDE_FILES:
        abs_path = os.path.join(root, f)
        arc = posixpath.join('', f.replace('\\', '/'))
        zf.write(abs_path, arc)

    # ディレクトリを再帰追加（arcnameはPOSIXのスラッシュ）
    for d in INCLUDE_DIRS:
        abs_dir = os.path.join(root, d)
        for dirpath, dirnames, filenames in os.walk(abs_dir):
            for name in filenames:
                abs_file = os.path.join(dirpath, name)
                rel = os.path.relpath(abs_file, root).replace('\\', '/')
                arc = posixpath.join('', rel)
                zf.write(abs_file, arc)

print(zip_name)
