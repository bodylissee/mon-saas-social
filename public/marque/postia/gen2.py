from PIL import Image, ImageDraw, ImageFont

S=1024
BLEU=(37,99,235); ROSE=(236,72,153); BLANC=(255,255,255)
BLEU_C=(96,165,250); ROSE_C=(249,168,212); ARDOISE=(30,41,59); CREME=(250,247,255)
F="/usr/share/fonts/truetype/google-fonts/Poppins-ExtraBold.ttf"
try: ImageFont.truetype(F,10)
except Exception: F="/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"

def degrade(size,c1,c2):
    w,h=size; g=Image.new('RGB',(w,h)); d=ImageDraw.Draw(g); n=w+h
    for i in range(n):
        t=i/(n-1); col=tuple(int(c1[k]+(c2[k]-c1[k])*t) for k in range(3))
        d.line([(i,0),(0,i)],fill=col)
    return g

def masque(r=230):
    m=Image.new('L',(S,S),0); ImageDraw.Draw(m).rounded_rectangle([0,0,S-1,S-1],radius=r,fill=255); return m

def largeur(d,t,f):
    b=d.textbbox((0,0),t,font=f); return b[2]-b[0], b

def une_ligne(fond, c_post, c_ia, nom, taille=235):
    im=fond.convert('RGBA'); im.putalpha(masque())
    d=ImageDraw.Draw(im); f=ImageFont.truetype(F,taille)
    w1,_=largeur(d,"Post",f); w2,_=largeur(d,"IA",f)
    b=d.textbbox((0,0),"PostIA",f=f) if False else d.textbbox((0,0),"PostIA",font=f)
    x=(S-(w1+w2))/2; y=(S-(b[3]-b[1]))/2-b[1]
    d.text((x,y),"Post",font=f,fill=c_post); d.text((x+w1,y),"IA",font=f,fill=c_ia)
    im.save(nom)

def deux_lignes(fond, c_post, c_ia, nom, taille=380):
    im=fond.convert('RGBA'); im.putalpha(masque())
    d=ImageDraw.Draw(im); f=ImageFont.truetype(F,taille)
    w1,b1=largeur(d,"Post",f); w2,b2=largeur(d,"IA",f)
    h1=b1[3]-b1[1]; h2=b2[3]-b2[1]; inter=30
    total=h1+inter+h2; y0=(S-total)/2
    d.text(((S-w1)/2 - b1[0], y0-b1[1]),"Post",font=f,fill=c_post)
    d.text(((S-w2)/2 - b2[0], y0+h1+inter-b2[1]),"IA",font=f,fill=c_ia)
    im.save(nom)

uni=lambda c: Image.new('RGB',(S,S),c)

# 1 ligne
une_ligne(uni(BLANC), BLEU, ROSE, "G_blanc_1l.png")
une_ligne(degrade((S,S),BLEU,ROSE), BLANC, BLANC, "H_degrade_1l.png")
une_ligne(uni(CREME), ARDOISE, ROSE, "I_creme_1l.png")
une_ligne(uni(BLEU), BLANC, ROSE_C, "J_bleu_1l.png")
# 2 lignes
deux_lignes(uni(BLANC), BLEU, ROSE, "K_blanc_2l.png")
deux_lignes(degrade((S,S),BLEU,ROSE), BLANC, BLANC, "L_degrade_2l.png")
deux_lignes(uni(ARDOISE), BLANC, ROSE, "M_ardoise_2l.png")
deux_lignes(uni(CREME), BLEU, ROSE, "N_creme_2l.png")
print("ok")
