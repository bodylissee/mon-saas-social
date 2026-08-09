from PIL import Image, ImageDraw, ImageFont
BLEU=(37,99,235); ROSE=(236,72,153); BLANC=(255,255,255)
F="/usr/share/fonts/truetype/google-fonts/Poppins-ExtraBold.ttf"
try: ImageFont.truetype(F,10)
except Exception: F="/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"

def degrade(w,h,c1,c2):
    g=Image.new('RGB',(w,h)); d=ImageDraw.Draw(g); n=w+h
    for i in range(n):
        t=i/(n-1); col=tuple(int(c1[k]+(c2[k]-c1[k])*t) for k in range(3))
        d.line([(i,0),(0,i)],fill=col)
    return g

def deux_lignes(S, rayon, taille, fond=None, texte=BLANC, transparent=False):
    im=(fond or degrade(S,S,BLEU,ROSE)).convert('RGBA')
    if transparent:
        im=Image.new('RGBA',(S,S),(0,0,0,0))
    else:
        m=Image.new('L',(S,S),0); ImageDraw.Draw(m).rounded_rectangle([0,0,S-1,S-1],radius=rayon,fill=255)
        im.putalpha(m)
    d=ImageDraw.Draw(im); f=ImageFont.truetype(F,taille)
    b1=d.textbbox((0,0),"Post",font=f); b2=d.textbbox((0,0),"IA",font=f)
    w1=b1[2]-b1[0]; h1=b1[3]-b1[1]; w2=b2[2]-b2[0]; h2=b2[3]-b2[1]
    inter=int(taille*0.08); total=h1+inter+h2; y0=(S-total)/2
    if transparent:
        d.text(((S-w1)/2-b1[0], y0-b1[1]),"Post",font=f,fill=BLEU)
        d.text(((S-w2)/2-b2[0], y0+h1+inter-b2[1]),"IA",font=f,fill=ROSE)
    else:
        d.text(((S-w1)/2-b1[0], y0-b1[1]),"Post",font=f,fill=texte)
        d.text(((S-w2)/2-b2[0], y0+h1+inter-b2[1]),"IA",font=f,fill=texte)
    return im

# Avatars / icones
deux_lignes(1024,230,380).save("postia-avatar-1024.png")
deux_lignes(512,115,190).save("postia-avatar-512.png")
deux_lignes(180,40,67).save("postia-icone-180.png")
deux_lignes(512,0,190).save("postia-carre-plein-512.png")     # sans coins arrondis
deux_lignes(512,115,190,transparent=True).save("postia-transparent-512.png")

# Favicons
for s in (32,64,180):
    deux_lignes(s, int(s*0.22), int(s*0.37)).save(f"postia-favicon-{s}.png")

# Banniere horizontale (une ligne, fond degrade)
W,H=1500,500
ban=degrade(W,H,BLEU,ROSE).convert('RGBA')
d=ImageDraw.Draw(ban); f=ImageFont.truetype(F,190)
b=d.textbbox((0,0),"PostIA",font=f)
d.text(((W-(b[2]-b[0]))/2-b[0],(H-(b[3]-b[1]))/2-b[1]),"PostIA",font=f,fill=BLANC)
f2=ImageFont.truetype("/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf",52)
s="Publie sur tous tes reseaux, automatiquement"
b2=d.textbbox((0,0),s,font=f2)
d.text(((W-(b2[2]-b2[0]))/2-b2[0], H/2+110),s,font=f2,fill=(240,240,255))
ban.convert('RGB').save("postia-banniere-1500x500.png")
print("ok")
