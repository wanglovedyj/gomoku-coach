from PIL import Image, ImageDraw, ImageFont
import os

# 创建 144x144 的图像
size = 144
img = Image.new('RGBA', (size, size), (245, 222, 179, 255))  # 棋盘木色背景
draw = ImageDraw.Draw(img)

# 绘制圆角矩形背景（棋盘）
bg_margin = 8
bg_size = size - 2 * bg_margin
draw.rounded_rectangle(
    [bg_margin, bg_margin, size - bg_margin, size - bg_margin],
    radius=12,
    fill=(222, 184, 135, 255),  # 棋盘颜色
    outline=(139, 69, 19, 255),  # 边框颜色
    width=2
)

# 绘制棋盘网格线
grid_margin = 20
grid_size = size - 2 * grid_margin
line_color = (101, 67, 33, 255)  # 深棕色线条

# 画横线
for i in range(5):
    y = grid_margin + i * (grid_size // 4)
    draw.line([(grid_margin, y), (size - grid_margin, y)], fill=line_color, width=1)

# 画竖线
for i in range(5):
    x = grid_margin + i * (grid_size // 4)
    draw.line([(x, grid_margin), (x, size - grid_margin)], fill=line_color, width=1)

# 绘制棋子（黑棋和白棋）
stone_radius = 10

# 黑棋 - 左上
draw.ellipse(
    [grid_margin + 5 - stone_radius, grid_margin + 5 - stone_radius,
     grid_margin + 5 + stone_radius, grid_margin + 5 + stone_radius],
    fill=(30, 30, 30, 255),
    outline=(0, 0, 0, 255),
    width=1
)

# 白棋 - 右下
draw.ellipse(
    [size - grid_margin - 5 - stone_radius, size - grid_margin - 5 - stone_radius,
     size - grid_margin - 5 + stone_radius, size - grid_margin - 5 + stone_radius],
    fill=(245, 245, 245, 255),
    outline=(150, 150, 150, 255),
    width=1
)

# 添加文字"五子棋"
try:
    # 尝试使用系统字体
    font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc", 20)
except:
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", 20)
    except:
        font = ImageFont.load_default()

# 绘制文字（在底部）
text = "陪练"
text_bbox = draw.textbbox((0, 0), text, font=font)
text_width = text_bbox[2] - text_bbox[0]
text_x = (size - text_width) // 2
text_y = size - 28

draw.text((text_x, text_y), text, fill=(139, 69, 19, 255), font=font)

# 保存为 PNG
output_path = "/root/.openclaw/workspace/gomoku-weapp/images/logo.png"
img.save(output_path, "PNG")

print(f"Logo 已生成: {output_path}")
print(f"尺寸: {img.size}")
print(f"文件大小: {os.path.getsize(output_path) / 1024:.2f} KB")