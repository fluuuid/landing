#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec4 uLogoRect;
uniform sampler2D uLogo;
uniform float uTime;
uniform float uGlitch;
uniform float uTear;
uniform float uMotion;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float logo(vec2 uv) {
  vec2 local=(uv-uLogoRect.xy)/max(uLogoRect.zw,vec2(.00001));
  if(local.x<0. || local.x>1. || local.y<0. || local.y>1.) return 0.;
  return texture2D(uLogo,local).a;
}
void main() {
  vec2 uv=gl_FragCoord.xy/uResolution;
  vec2 aspect=vec2(uResolution.x/uResolution.y,1.);
  vec2 px=1./uResolution;
  float frame=floor(uTime*25.);
  float g=uGlitch, tear=uTear;
  vec2 q=uv;
  // Displace the entire image in coarse strips and fine scanlines.
  float coarse=floor(uv.y*24.);
  float bandSeed=hash(vec2(coarse,frame));
  float band=step(.64,bandSeed);
  float fineRow=floor(gl_FragCoord.y/2.);
  float fineSeed=hash(vec2(fineRow,frame));
  float shift=(bandSeed-.5)*.24*band*tear;
  shift+=(fineSeed-.5)*.014*g*step(.36,fineSeed);
  q.x+=shift;
  q.y+=(hash(vec2(frame,31.))-.5)*.1*tear;
  q=(q-.5)/(1.+g*.08)+.5;
  vec2 p=(q-.5)*aspect;
  float glow=exp(-length((q-vec2(.51,1.1))*vec2(1.05,1.35))*2.9);
  float vignette=1.-smoothstep(.18,1.17,length(p*vec2(.72,1.15)));
  float bg=(.018+glow*.065)*vignette;
  bg+=exp(-length(p*vec2(1.2,2.5))*5.)*.01;
  bg+=exp(-length((uv-uPointer)*aspect)*3.5)*.012*uMotion;
  // Moving monochrome light leaks behind the broken image.
  float leakX=hash(vec2(floor(frame/3.),9.));
  float leak=exp(-abs(q.x-leakX)*6.);
  float gate=step(.48,hash(vec2(floor(frame/2.),71.)));
  bg+=leak*tear*gate*.32;
  float wideBand=step(.82,hash(vec2(floor(q.y*11.),floor(frame/2.))));
  bg+=wideBand*tear*(.045+leak*.14);
  bg*=1.-band*tear*.6;
  // Multiple displaced samples of the real logo form the ghost trails.
  float mark=logo(q), echoes=0.;
  float direction=hash(vec2(frame,4.))>.45 ? 1. : -1.;
  float spacing=(4.+hash(vec2(frame,7.))*9.)*px.x*g;
  for(int i=1;i<=6;i++) {
    float n=float(i);
    vec2 trail=vec2(direction*spacing*n,sin(n*1.7+frame)*px.y*g*2.);
    echoes=max(echoes,logo(q+trail)*(1.-n/8.)*g*.76);
  }
  float soft=logo(q+vec2(px.x*2.,0.))+logo(q-vec2(px.x*2.,0.));
  soft+=logo(q+vec2(0.,px.y*2.))+logo(q-vec2(0.,px.y*2.));
  float dropout=mix(1.,.42,step(.78,fineSeed)*g);
  float white=max(mark*dropout,echoes);
  float value=bg+white*.91+soft*.02;
  // Sparse debris, compression blocks, and hairline tearing.
  vec2 cell=floor(uv*vec2(160.,88.)), local=fract(uv*vec2(160.,88.));
  float seed=hash(cell);
  float scratch=step(.979,seed)*step(local.y,.12)*step(local.x,.55);
  scratch*=step(.4,hash(cell+floor(frame/2.)))*g;
  float line=step(.996,hash(vec2(fineRow,frame)))*tear;
  float block=step(.94,hash(vec2(floor(uv.x*18.),coarse+frame)));
  value+=scratch*.26+line*.13;
  value*=1.-block*band*tear*.65;
  value+=(hash(gl_FragCoord.xy+mod(frame,100.))-.5)*(.006+g*.032);
  gl_FragColor=vec4(vec3(max(value,0.)),1.);
}
