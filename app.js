import * as THREE from 'three';
import { RoundedBoxGeometry } from './assets/vendor/RoundedBoxGeometry.js';

const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const projects = [
  {slug:'pudgy-penguins',name:'Pudgy Penguins',symbol:'◒',url:'https://www.pudgypenguins.com',socials:[['X','https://x.com/pudgypenguins'],['Instagram','https://instagram.com/pudgypenguins'],['LinkedIn','https://www.linkedin.com/in/akashvenkat12']],body:['A universe of characters, stories, and shared possibilities. Pudgy Penguins brings an imaginative cast of penguins to life through digital collectibles, physical products, and a worldwide community.','Acquired by IceAge in 2022, the brand explores how an internet-born community can help shape an entertainment company. Its characters connect the digital and physical worlds through experiences people can collect, participate in, and make their own.']},
  {slug:'overpass',name:'Overpass',symbol:'⌘',url:'https://www.overpassip.com',socials:[['X','https://x.com/OverpassIP']],body:['A bridge between digital ownership and real-world opportunity. OverpassIP provides a way for NFT holders to put their digital assets forward for licensing consideration.','The platform connects brands with digital intellectual property and lets collections bring their communities into new collaborations. It grew out of the licensing challenges faced by Pudgy Penguins and explores new ways for creators, owners, and brands to work together.']}
];
const dialog = $('#project-dialog');
let returnFocus = null;
function openProject(index, updateHistory=true){
  const p=projects[index]; if(!p)return;
  returnFocus=document.activeElement;
  $('#detail-index').textContent=`PORTFOLIO_CO_0${index+1}`;
  $('#detail-title').textContent=p.name;
  $('#detail-symbol').textContent=p.symbol;
  $('#detail-body').replaceChildren(...p.body.map(t=>{const e=document.createElement('p');e.textContent=t;return e;}));
  $('#detail-socials').replaceChildren(...p.socials.map(([label,url])=>{const a=document.createElement('a');a.textContent=`[ ${label} ] ↗`;a.href=url;a.target='_blank';a.rel='noreferrer';return a;}));
  $('#detail-visit').href=p.url;
  document.body.classList.add('detail-open');
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;
  if(updateHistory)history.pushState({project:index},'',`#/portfolio/${p.slug}`);
}
function closeProject(updateHistory=true){
  dialog.close();document.body.classList.remove('detail-open');
  if(updateHistory)history.pushState({},'',location.pathname+location.search);
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
}
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(+b.dataset.project)));
$('#close-detail').addEventListener('click',()=>closeProject());
dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject();});
window.addEventListener('hashchange',()=>{const i=projects.findIndex(p=>location.hash===`#/portfolio/${p.slug}`);i>=0?openProject(i,false):closeProject(false);});
function goScene(n){window.scrollTo({top:n*innerHeight,behavior:reduced.matches?'instant':'smooth'});}
$('#home').addEventListener('click',()=>{if(dialog.open)closeProject();goScene(0);});
$('#discover').addEventListener('click',()=>goScene(Math.min(2,Math.round(scrollY/innerHeight)+1)));
document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>goScene(+b.dataset.scene)));
$('#fallback-explore').addEventListener('click',()=>goScene(1));
window.addEventListener('keydown',e=>{
  if(dialog.open||e.altKey||e.metaKey||e.ctrlKey||/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();goScene(Math.min(2,Math.floor(scrollY/innerHeight+.05)+1));}
  if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();goScene(Math.max(0,Math.ceil(scrollY/innerHeight-.05)-1));}
});

let audio=null;
$('#sound').addEventListener('click',async()=>{
  try{
    if(!audio){
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context){$('#sound span').textContent='Sound unavailable';return;}
      const ctx=new Context(), master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
      const buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=buffer.getChannelData(0);
      let last=0;for(let i=0;i<data.length;i++){last=(last+(Math.random()*2-1)*.025)/1.025;data[i]=last*3;}
      const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;
      const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=550;noise.connect(low);low.connect(master);noise.start();
      for(const f of [65.4,98]){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.022;o.connect(g);g.connect(master);o.start();}
      audio={ctx,master,on:false};
    }
    await audio.ctx.resume();audio.on=!audio.on;audio.master.gain.setTargetAtTime(audio.on?.24:0,audio.ctx.currentTime,.5);
    $('#sound').setAttribute('aria-pressed',String(audio.on));$('#sound span').textContent=`Sound: ${audio.on?'On':'Off'}`;
  }catch{$('#sound span').textContent='Sound unavailable';}
});

let sceneProgress=0;
function syncPage(){
  sceneProgress=Math.min(2,Math.max(0,scrollY/innerHeight));
  const active=Math.round(sceneProgress);
  $('.portfolio').classList.toggle('visible',active===1);
  $('.connect').classList.toggle('visible',active===2);
  $('#manifesto').style.opacity=String(Math.max(0,1-sceneProgress*2));
  $('.legal').style.opacity=String(Math.max(0,1-sceneProgress*2));
  $('.study-label').style.opacity=String(Math.max(0,.7-sceneProgress));
  $('#discover').style.visibility=active===2?'hidden':'visible';
  document.querySelectorAll('[data-scene]').forEach((b,i)=>{b.classList.toggle('active',i===active);if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
}
window.addEventListener('scroll',syncPage,{passive:true});syncPage();

// Deterministic terrain, surface and block geometry are authored for this study.
let seed=714;
function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
function hash(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
function noise(x,y){const a=Math.floor(x),b=Math.floor(y);let u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(a,b),hash(a+1,b),u),THREE.MathUtils.lerp(hash(a,b+1),hash(a+1,b+1),u),v);}
function fbm(x,y){let v=0,amp=.5;for(let k=0;k<5;k++){v+=noise(x,y)*amp;x=x*2.04+12.3;y=y*2.04+5.7;amp*=.48;}return v;}
function surfaceTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),im=ctx.createImageData(512,512);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){const f=fbm(x/38,y/38),grain=hash(x,y);const v=113+f*94+grain*23;const i=(y*512+x)*4;im.data[i]=v*.96;im.data[i+1]=v*.99;im.data[i+2]=v*1.04;im.data[i+3]=255;}
  ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function terrainHeight(x,z){
  const d=Math.sqrt(x*x+z*z);
  let h=(fbm(x*.32+9,z*.32+3)-.5)*1.3+(fbm(x*1.2,z*1.2)-.5)*.18;
  h*=THREE.MathUtils.smoothstep(d,2.4,7);
  const mountain= Math.max(0,-z-8)*.12;
  h+=mountain*(.35+fbm(x*.15+5,z*.16)*2.5);
  h+=Math.exp(-((x+10)**2/35+(z+16)**2/45))*4.8;
  h+=Math.exp(-((x-13)**2/60+(z+23)**2/55))*6.5;
  return h-.25;
}

let renderer,scene,camera,IceAge,portfolio,network,blocks=[],particles,clock;
let bloomTarget,blurA,blurB,screenScene,screenCamera,blurMaterial,combineMaterial;
let renderReady=false;
const pointer=new THREE.Vector2();
window.addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=e.clientY/innerHeight*2-1;},{passive:true});
function makeBlock(w,h,d,material){
  const g=new RoundedBoxGeometry(w,h,d,3,.065);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=(noise(x*15+17,y*15+z*13)-.5)*.028;p.setXYZ(i,x+n,y+n*.6,z+n);}
  g.computeVertexNormals();return new THREE.Mesh(g,material);
}
function init3D(){
  scene=new THREE.Scene();scene.background=new THREE.Color('#a8adb7');scene.fog=new THREE.FogExp2('#b1b6c0',.042);
  camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.1,100);camera.position.set(6.7,4.4,10.7);
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('#world').append(renderer.domElement);
  const ambient=new THREE.HemisphereLight('#eef5ff','#576274',2.0);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#ffffff',3.5);sun.position.set(-5,12,-7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.0003;sun.shadow.normalBias=.045;sun.shadow.radius=4;scene.add(sun);
  const fill=new THREE.DirectionalLight('#d0defc',.7);fill.position.set(5,3,9);scene.add(fill);
  const tex=surfaceTexture();tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const terrainTex=tex.clone();terrainTex.repeat.set(25,25);terrainTex.needsUpdate=true;
  const groundGeo=new THREE.PlaneGeometry(95,95,230,230);groundGeo.rotateX(-Math.PI/2);const gp=groundGeo.attributes.position;
  for(let i=0;i<gp.count;i++)gp.setY(i,terrainHeight(gp.getX(i),gp.getZ(i)));groundGeo.computeVertexNormals();
  const ground=new THREE.Mesh(groundGeo,new THREE.MeshStandardMaterial({map:terrainTex,bumpMap:terrainTex,bumpScale:.22,roughness:.94,color:'#a9b0bf'}));ground.receiveShadow=true;scene.add(ground);
  const rockMat=new THREE.MeshStandardMaterial({map:tex,bumpMap:tex,bumpScale:.15,roughness:1,color:'#9ba4b5'});
  for(let i=0;i<50;i++){
    const x=(rand()-.5)*34,z=(rand()-.5)*28;if(Math.hypot(x,z)<4.1)continue;
    const r=.13+rand()*.65,geo=new THREE.DodecahedronGeometry(r,1),p=geo.attributes.position;
    for(let j=0;j<p.count;j++)p.setXYZ(j,p.getX(j)*(1+noise(p.getX(j)*7,p.getZ(j)*7)*.32),p.getY(j)*.5,p.getZ(j)*(1+noise(p.getX(j)*7,p.getZ(j)*7)*.4));geo.computeVertexNormals();
    const rock=new THREE.Mesh(geo,rockMat);rock.position.set(x,terrainHeight(x,z),z);rock.rotation.y=rand()*6;rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);
  }
  IceAge=new THREE.Group();scene.add(IceAge);
  const ice=new THREE.MeshStandardMaterial({map:tex,bumpMap:tex,bumpScale:.095,color:'#c5cbd5',roughness:.84,metalness:.04,emissive:'#bbcfff',emissiveIntensity:.025});
  const glow=new THREE.MeshStandardMaterial({color:'#e3f4ff',emissive:'#dcf0ff',emissiveIntensity:1.25,side:THREE.DoubleSide,roughness:.7});
  const core=new THREE.Mesh(new THREE.SphereGeometry(1.72,48,28,0,Math.PI*2,0,Math.PI/2),glow);core.scale.y=1.48;core.position.y=.0;IceAge.add(core);
  const rings=[{y:.25,r:1.89,n:17},{y:.73,r:1.85,n:16},{y:1.21,r:1.71,n:15},{y:1.69,r:1.47,n:12},{y:2.15,r:1.1,n:9},{y:2.53,r:.62,n:6}];
  rings.forEach((row,ri)=>{
    for(let j=0;j<row.n;j++){
      const a=j/row.n*Math.PI*2+(ri%2)*Math.PI/row.n;
      const frontDelta=Math.atan2(Math.sin(a),Math.cos(a));
      if(ri<3&&Math.abs(frontDelta)<.30)continue;
      const b=makeBlock(2*Math.PI*row.r/row.n-.025,.46,.61,ice);
      b.position.set(Math.sin(a)*row.r,row.y,Math.cos(a)*row.r);b.rotation.set(-ri*.075,a,0);b.castShadow=b.receiveShadow=true;
      b.userData={base:b.position.clone(),rotation:b.rotation.clone(),angle:a,ring:ri,phase:rand()*Math.PI*2};blocks.push(b);let renderer,scene,camera,IceAge,portfolio,network,blocks=[],particles,clock;
      IceAge.add(b);
    }
  });
  const cap=makeBlock(.65,.3,.68,ice);cap.position.set(0,2.79,0);cap.castShadow=true;let renderer,scene,camera,IceAge,portfolio,network,blocks=[],particles,clock;
  IceAge.add(cap);
  // Two short walls and a rounded five-piece arch form the entrance.
  for(let side of [-1,1])for(let r=0;r<3;r++)for(let depth=0;depth<2;depth++){
    const b=makeBlock(.43,.43,.59,ice);b.position.set(side*.68,.24+r*.44,1.96+depth*.54);b.castShadow=b.receiveShadow=true;IceAge.add(b);
  }
  for(let i=0;i<7;i++){
    const a=i/6*Math.PI,b=makeBlock(.42,.46,.85,ice);b.position.set(Math.cos(a)*.69,1.08+Math.sin(a)*.69,2.25);b.rotation.z=a-Math.PI/2;b.castShadow=b.receiveShadow=true;IceAge.add(b);
  }
  for(let r=0;r<3;r++){const door=makeBlock(.87,.36,.27,ice);door.position.set(0,.2+r*.37,2.47);door.castShadow=door.receiveShadow=true;IceAge.add(door);}
  const entryLight=new THREE.PointLight('#dcecff',8,5,2);entryLight.position.set(0,.7,1.8);IceAge             .add(entryLight);
  // Sparse annotation lines stay attached to the ice surface.
  const linePositions=[];for(let i=0;i<7;i++){const x=(rand()-.5)*2.3,y=.8+rand()*1.4;linePositions.push(x,y,1.72,x+.25,y+.3,1.65);}
  const lines=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3)),new THREE.LineBasicMaterial({color:'#eef7ff',transparent:true,opacity:.5}));IceAge.add(lines);
  for(let i=0;i<4;i++){
    const c=document.createElement('canvas');c.width=64;c.height=32;const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.font='bold 17px monospace';ctx.fillText(String(17+i*9),4,21);const t=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,opacity:.85}));sp.scale.set(.3,.15,1);sp.position.set(-.9+i*.54,.9+(i%2)*.63,1.89);IceAge.add(sp);
  }
  portfolio=new THREE.Group();scene.add(portfolio);
  const cubeMaterial=new THREE.MeshPhysicalMaterial({color:'#d8e8fa',roughness:.24,metalness:.08,transparent:true,opacity:.58,transmission:0,clearcoat:1,clearcoatRoughness:.2});
  for(let i=0;i<2;i++){
    const group=new THREE.Group();group.position.set(i===0?-2.1:2.1,1.45,0);const cube=makeBlock(2.05,2.05,2.05,cubeMaterial);cube.rotation.set(.08,i===0?-.25:.25,-.05);group.add(cube);
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.06,2.06,2.06)),new THREE.LineBasicMaterial({color:'#e8f5ff',transparent:true,opacity:.55}));edge.rotation.copy(cube.rotation);group.add(edge);
    const sculpture=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:i===0?'#b8c7de':'#bcd8ec',roughness:.5,metalness:.2});
    if(i===0){
      const body=new THREE.Mesh(new THREE.SphereGeometry(.61,32,24),mat);body.scale.set(.8,1.05,.65);sculpture.add(body);
      const belly=new THREE.Mesh(new THREE.SphereGeometry(.45,24,20),new THREE.MeshStandardMaterial({color:'#eef4fc',roughness:.8}));belly.scale.set(.75,1,.36);belly.position.set(0,-.05,.32);sculpture.add(belly);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.42,24,20),mat);head.position.y=.5;sculpture.add(head);
      for(const x of [-.13,.13]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.035,12,12),new THREE.MeshBasicMaterial({color:'#28354a'}));eye.position.set(x,.57,.38);sculpture.add(eye);}
      const beak=new THREE.Mesh(new THREE.ConeGeometry(.09,.2,4),new THREE.MeshStandardMaterial({color:'#dee7f0'}));beak.rotation.x=Math.PI/2;beak.position.set(0,.43,.43);sculpture.add(beak);
      for(const x of [-.48,.48]){const wing=new THREE.Mesh(new THREE.SphereGeometry(.2,16,16),mat);wing.scale.set(.4,1.5,.7);wing.position.set(x,-.02,0);wing.rotation.z=x;sculpture.add(wing);}
    }else{const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(.5,.13,100,12,2,3),mat);sculpture.add(knot);}
    sculpture.scale.setScalar(.9);group.add(sculpture);group.userData={index:i,sculpture};portfolio.add(group);
  }
  network=new THREE.Group();scene.add(network);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.9,.018,8,140),new THREE.MeshBasicMaterial({color:'#dbeaff',transparent:true,opacity:.45}));ring.rotation.x=1.1;network.add(ring);
  const starPoints=[];
  for(let i=0;i<80;i++){const a=rand()*Math.PI*2,r=2.5+rand()*3;starPoints.push(Math.cos(a)*r,(rand()-.5)*5,Math.sin(a)*r);}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(starPoints,3));network.add(new THREE.Points(sg,new THREE.PointsMaterial({color:'#eef7ff',size:.035,transparent:true,opacity:.7})));
  const snowPos=[];for(let i=0;i<600;i++)snowPos.push((rand()-.5)*34,rand()*12,(rand()-.5)*30);
  const snowGeo=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(snowPos,3));
  const sc=document.createElement('canvas');sc.width=sc.height=32;const sx=sc.getContext('2d'),gr=sx.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#ffffff00');sx.fillStyle=gr;sx.fillRect(0,0,32,32);
  particles=new THREE.Points(snowGeo,new THREE.PointsMaterial({map:new THREE.CanvasTexture(sc),color:'#ffffff',size:.055,transparent:true,opacity:.65,depthWrite:false}));scene.add(particles);
  setupBloom();clock=new THREE.Clock();renderReady=true;resize();animate();
}
function setupBloom(){
  const options={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,type:THREE.HalfFloatType};
  bloomTarget=new THREE.WebGLRenderTarget(innerWidth,innerHeight,options);blurA=new THREE.WebGLRenderTarget(320,180,options);blurB=blurA.clone();
  screenScene=new THREE.Scene();screenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const vertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  blurMaterial=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},direction:{value:new THREE.Vector2()},extract:{value:1}},vertexShader:vertex,fragmentShader:`varying vec2 vUv;uniform sampler2D tDiffuse;uniform vec2 direction;uniform float extract;void main(){vec3 c=vec3(0.);for(int i=-5;i<=5;i++){vec3 p=texture2D(tDiffuse,vUv+direction*float(i)).rgb;if(extract>.5)p=max(p-vec3(.72),vec3(0.));c+=p*exp(-float(i*i)/12.);}gl_FragColor=vec4(c/6.1,1.);}`});
  combineMaterial=new THREE.ShaderMaterial({uniforms:{tScene:{value:null},tBloom:{value:null}},vertexShader:vertex,fragmentShader:`varying vec2 vUv;uniform sampler2D tScene;uniform sampler2D tBloom;void main(){vec3 c=texture2D(tScene,vUv).rgb;c+=texture2D(tBloom,vUv).rgb*.4;float grain=fract(sin(dot(vUv*1234.5,vec2(12.9898,78.233)))*43758.5453);c+=(grain-.5)*.016;gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
  screenScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),blurMaterial));
}
function resize(){
  if(!renderReady)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
  const ratio=renderer.getPixelRatio();bloomTarget.setSize(Math.floor(innerWidth*ratio),Math.floor(innerHeight*ratio));blurA.setSize(Math.floor(innerWidth*.3),Math.floor(innerHeight*.3));blurB.setSize(Math.floor(innerWidth*.3),Math.floor(innerHeight*.3));syncPage();
}
window.addEventListener('resize',resize);
let smoothProgress=0,firstFrame=true;
const lightBg=new THREE.Color('#a8adb7'),darkBg=new THREE.Color('#27374e'),finalBg=new THREE.Color('#19283c');
const target=new THREE.Vector3(),look=new THREE.Vector3();
function animate(){
  requestAnimationFrame(animate);if(document.hidden)return;
  const t=clock.getElapsedTime(),motion=reduced.matches?0:1;
  smoothProgress=THREE.MathUtils.lerp(smoothProgress,sceneProgress,reduced.matches?1:.07);
  const p=smoothProgress,a=THREE.MathUtils.smoothstep(p,.3,.92),b=THREE.MathUtils.smoothstep(p,1.2,1.9);
  const mobile=innerWidth<640;
  scene.background.copy(lightBg).lerp(darkBg,a).lerp(finalBg,b);scene.fog.color.copy(scene.background);scene.fog.density=.042+a*.008;
  let renderer,scene,camera,IceAge,portfolio,network,blocks=[],particles,clock;
  IceAge.visible=p<1;portfolio.visible=p>.3&&p<1.9;network.visible=p>1.2;
  IceAge.position.set(-a*3,-.25-a*3.3,0);IceAge.scale.setScalar(1-a*.2);IceAge.rotation.y=.2+Math.sin(t*.08)*.03*motion;
  const breath=(Math.sin(t*.45)*.5+.5)*.045*motion;
  for(const block of blocks){const d=block.userData;const top=Math.max(0,(d.ring-1)/4);const lift=breath*top;block.position.copy(d.base);block.position.y+=lift+Math.sin(t*.5+d.phase)*.008*motion;block.position.x+=Math.sin(d.angle)*lift*.5;block.position.z+=Math.cos(d.angle)*lift*.5;}
  const explode=Math.max(0,.8-t*.13)*motion;
  if(explode>0)for(const block of blocks){const d=block.userData;block.position.y+=explode*Math.max(0,d.ring-1)*.22;block.position.x+=Math.sin(d.angle)*explode*.15;block.position.z+=Math.cos(d.angle)*explode*.15;}
  portfolio.position.y=(1-a)*-4-b*3.5;
  for(const group of portfolio.children){const i=group.userData.index;group.position.x=(i===0?-1:1)*(mobile?1.05:2.1);group.position.y=1.55+Math.sin(t*.55+i)*.08*motion;group.rotation.y=Math.sin(t*.18+i)*.1*motion;group.scale.setScalar(mobile?.75:1);group.userData.sculpture.rotation.y=t*.1*motion;}
  network.rotation.y=t*.035*motion;network.position.y=1.5;network.scale.setScalar(b);
  const snow=particles.geometry.attributes.position;
  if(motion)for(let i=0;i<snow.count;i++){snow.setY(i,snow.getY(i)-.006);snow.setX(i,snow.getX(i)+.0015);if(snow.getY(i)<-.5)snow.setY(i,12);if(snow.getX(i)>17)snow.setX(i,-17);}snow.needsUpdate=true;
  const dist=mobile?14:9.7;
  target.set(-6.1*(1-a)+pointer.x*.18*motion,3.45+pointer.y*.08*motion,dist+a*1.2);camera.position.lerp(target,.035);
  look.set(-.12,1.05+a*.35,0);camera.lookAt(look);
  renderer.setRenderTarget(bloomTarget);renderer.render(scene,camera);
  screenScene.children[0].material=blurMaterial;blurMaterial.uniforms.tDiffuse.value=bloomTarget.texture;blurMaterial.uniforms.direction.value.set(1/blurA.width,0);blurMaterial.uniforms.extract.value=1;renderer.setRenderTarget(blurA);renderer.render(screenScene,screenCamera);
  blurMaterial.uniforms.tDiffuse.value=blurA.texture;blurMaterial.uniforms.direction.value.set(0,1/blurA.height);blurMaterial.uniforms.extract.value=0;renderer.setRenderTarget(blurB);renderer.render(screenScene,screenCamera);
  screenScene.children[0].material=combineMaterial;combineMaterial.uniforms.tScene.value=bloomTarget.texture;combineMaterial.uniforms.tBloom.value=blurB.texture;renderer.setRenderTarget(null);renderer.render(screenScene,screenCamera);
  if(firstFrame){firstFrame=false;$('#loader').classList.add('done');}
}
try{init3D();}catch(error){console.error('3D initialization failed:',error);$('#fallback').hidden=false;$('#loader').classList.add('done');}
const initialProject=projects.findIndex(p=>location.hash===`#/portfolio/${p.slug}`);
if(initialProject>=0){goScene(1);openProject(initialProject,false);}
