import urllib.parse
import os
import subprocess

# 1. Generate the base inlined HTML
print("Running html-inline...")
subprocess.run(["npx", "html-inline", "-i", "index.html", "-o", "temp_inline.html"], check=True)

# 2. Read the Markdown content
print("Reading Markdown...")
with open("温州市初中教学常规（2025年版）.md", "r", encoding="utf-8") as f:
    md_content = f.read()

# 3. Read the HTML
print("Reading HTML...")
with open("temp_inline.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# 4. Prepare the injection code
encoded_md = urllib.parse.quote(md_content)
injection = f'<script>window.__MD_CONTENT__ = decodeURIComponent("{encoded_md}");</script>'

# 5. Inject
final_html = html_content.replace("<body>", f"<body>\n{injection}")

# 6. Save final file
output_filename = "温州初中教学常规2025_离线版.html"
print(f"Writing {output_filename}...")
with open(output_filename, "w", encoding="utf-8") as f:
    f.write(final_html)

# Clean up
if os.path.exists("temp_inline.html"):
    os.remove("temp_inline.html")

print("Done!")
