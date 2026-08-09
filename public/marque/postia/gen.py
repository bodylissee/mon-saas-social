from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

S = 1024
BLEU  = (37, 99, 235)
ROSE  = (236, 72, 153)
SOMBRE= (15, 23, 42)
BLANC = (255,255,255)
P_BOLD = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
P_XBOLD = "/usr/share/fonts/truetype/google-fonts/Poppins-ExtraBold.ttf"
try:
    ImageFont.truetype(P_XBOLD, 10); BOLD = P_XBOLD
except Exception:
    BOLD = P_BOLD

def degrade(size, c1, c2, diagonal=True):
    w,h = size
    g = Image.new('RGB', (w,h))
    d = ImageDraw.Draw(g)
    n = w+h if diagonal else h
    for i in range(n):
        t = i/(n-1)
        col = tuple(int(c1[k]+(c2[k]-c1[k])*t) for k in range(3))
        if diagonal:
            d.line([(i,0),(0,i)], fill=col)
        else:
            d.line([(0,i),(w,i)], fill=col)
    return g

def carre_arrondi_masque(size, r):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0,0,size[0]-1,size[1]-1], radius=r, fill=255)
    return m

def centrer(d, txt, font, box, fill):
    x0,y0,x1,y1 = box
    l,t,r,b = d.textbbox((0,0), txt, font=font)
    d.text((x0+((x1-x0)-(r-l))/2 - l, y0+((y1-y0)-(b-t))/2 - t), txt, font=font, fill=fill)

# ---- A : carre arrondi degrade + P blanc
def A():
    im = degrade((S,S), BLEU, ROSE).convert('RGBA')
    im.putalpha(carre_arrondi_masque((S,S), 230))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(BOLD, 620)
    centrer(d, "P", f, (0,-30,S,S), BLANC)
    im.save("A_p_degrade.png")

# ---- B : fond sombre + P degrade
def B():
    im = Image.new('RGBA',(S,S), SOMBRE+(255,))
    im.putalpha(carre_arrondi_masque((S,S), 230))
    lettre = Image.new('L',(S,S),0)
    d = ImageDraw.Draw(lettre)
    f = ImageFont.truetype(BOLD, 620)
    centrer(d, "P", f, (0,-30,S,S), 255)
    g = degrade((S,S), BLEU, ROSE).convert('RGBA')
    g.putalpha(lettre)
    im.alpha_composite(g)
    im.save("B_p_sombre.png")

# ---- C : bulle de dialogue + etincelle
def C():
    im = degrade((S,S), BLEU, ROSE).convert('RGBA')
    im.putalpha(carre_arrondi_masque((S,S), 230))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([215,255,809,700], radius=120, fill=BLANC)
    d.polygon([(330,690),(330,830),(460,690)], fill=BLANC)
    # etincelle 4 branches
    cx,cy,R,r2 = 512,478,150,40
    pts=[]
    for i in range(8):
        a = math.pi/2*(i/2) - math.pi/2
        rad = R if i%2==0 else r2
        pts.append((cx+rad*math.cos(a*1.0 + (math.pi/4 if i%2 else 0)), cy+rad*math.sin(a*1.0 + (math.pi/4 if i%2 else 0))))
    star=[]
    for i in range(8):
        a = i*math.pi/4
        rad = R if i%2==0 else r2
        star.append((cx+rad*math.cos(a), cy+rad*math.sin(a)))
    d.polygon(star, fill=BLEU)
    im.save("C_bulle.png")

# ---- D : avion en papier
def D():
    im = degrade((S,S), BLEU, ROSE).convert('RGBA')
    im.putalpha(carre_arrondi_masque((S,S), 230))
    d = ImageDraw.Draw(im)
    d.polygon([(250,300),(800,512),(250,724),(360,512)], fill=BLANC)
    d.polygon([(250,300),(360,512),(250,724)], fill=(230,235,250))
    im.save("D_avion.png")

# ---- E : lettrage Post + IA
def E():
    im = Image.new('RGBA',(S,S), SOMBRE+(255,))
    im.putalpha(carre_arrondi_masque((S,S), 230))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(BOLD, 250)
    t1, t2 = "Post", "IA"
    w1 = d.textbbox((0,0),t1,font=f)[2]-d.textbbox((0,0),t1,font=f)[0]
    w2 = d.textbbox((0,0),t2,font=f)[2]-d.textbbox((0,0),t2,font=f)[0]
    x = (S-(w1+w2))/2
    bb = d.textbbox((0,0),t1+t2,font=f)
    y = (S-(bb[3]-bb[1]))/2 - bb[1]
    d.text((x,y), t1, font=f, fill=BLANC)
    d.text((x+w1,y), t2, font=f, fill=ROSE)
    im.save("E_lettrage.png")

# ---- F : cercle degrade + eclair
def F():
    im = Image.new('RGBA',(S,S),(0,0,0,0))
    g = degrade((S,S), BLEU, ROSE).convert('RGBA')
    m = Image.new('L',(S,S),0); ImageDraw.Draw(m).ellipse([0,0,S-1,S-1], fill=255)
    g.putalpha(m); im.alpha_composite(g)
    d = ImageDraw.Draw(im)
    d.polygon([(560,180),(360,540),(500,540),(440,850),(680,470),(530,470)], fill=BLANC)
    im.save("F_eclair.png")

for f in (A,B,C,D,E,F): f()
print("ok")
