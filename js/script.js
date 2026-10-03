const scenes=[...document.querySelectorAll('.scene')];
const links=[...document.querySelectorAll('.chapter-nav a')];
const num=document.querySelector('#num');
const progress=document.querySelector('.scroll-progress i');
const nameContent=document.querySelector('.hero-scene .scene-content');
const nameHeading=nameContent.querySelector('h1');
const chapterNav=document.querySelector('.chapter-nav');

let currentScene='home';

function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v));}

function animate(){
  const pageMax=document.documentElement.scrollHeight-innerHeight;
  const global=clamp(scrollY/Math.max(1,pageMax));
  const nameProgress=clamp(scrollY/320);
  const isMobile=innerWidth<=768;
  const isSmallMobile=innerWidth<=450;
  const largeFontSize=isSmallMobile?innerWidth*.23:isMobile?innerWidth*.24:clamp(innerWidth*.17,85,250);
  const compactFontSize=isMobile?clamp(innerWidth*.05,20,28):clamp(innerWidth*.027,22,36);
  const startLeft=innerWidth*(isMobile?.08:.11);
  const compactLeft=isMobile?12:innerWidth*.03;
  const startTop=innerHeight*.5;
  const compactTop=isMobile?12:18;
  const startNavTop=isSmallMobile?8:isMobile?10:18;
  const compactNavTop=isMobile?52:startNavTop;

  nameContent.style.top=`${startTop+(compactTop-startTop)*nameProgress}px`;
  nameContent.style.left=`${startLeft+(compactLeft-startLeft)*nameProgress}px`;
  nameContent.style.transform=`translateY(${-50*(1-nameProgress)}%)`;
  nameHeading.style.fontSize=`${largeFontSize+(compactFontSize-largeFontSize)*nameProgress}px`;
  nameHeading.style.lineHeight=`${.76+.24*nameProgress}`;
  nameHeading.style.letterSpacing=`${-.105+.065*nameProgress}em`;
  nameHeading.style.textShadow=`0 ${25-21*nameProgress}px ${80-62*nameProgress}px rgba(0,0,0,${.75-.1*nameProgress})`;
  chapterNav.style.top=`${startNavTop+(compactNavTop-startNavTop)*nameProgress}px`;

  progress.style.width=(global*100)+'%';

  let nearest=null,best=Infinity;
  scenes.forEach(scene=>{
    const r=scene.getBoundingClientRect();
    const center=r.top+r.height*.5;
    const distance=Math.abs(center-innerHeight*.5);
    if(distance<best){best=distance;nearest=scene}
  });

  if(nearest && nearest.id!==currentScene){
    currentScene=nearest.id;
    const n=nearest.dataset.num;
    num.textContent=n;
    links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+nearest.id));
  }
}

addEventListener('scroll',animate,{passive:true});
addEventListener('resize',animate);
animate();

links.forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'instant'});
  });
});
