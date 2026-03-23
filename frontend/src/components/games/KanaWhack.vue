<template>
  <div class="game" :class="{ shaking: screenShake }" @touchmove.prevent>
    
    <!-- 全屏背景（含木牌+洞+吉祥物+宝箱） -->
    <img src="/images/whack/bg-full.png" class="bg" alt="" />

    <!-- HUD: 分数 + 倒计时 -->
    <div class="hud">
      <div class="pill score"><span>⭐</span><span>{{ score }}</span></div>
      <div class="pill timer" :class="{warn: timeLeft <= 10}"><span>⏱</span><span>{{ timeLeft }}s</span></div>
    </div>

    <!-- 目标提示 -->
    <div class="target">
      <transition name="pop" mode="out-in">
        <span class="target-inner" :key="targetKey">找到 <b>{{ targetDisplay }}</b></span>
      </transition>
    </div>

    <!-- Combo -->
    <transition name="cpop">
      <div v-if="combo >= 2" class="combo" :key="combo">🔥 {{ combo }}x</div>
    </transition>

    <!-- 9个洞（精确定位到背景洞口） -->
    <div v-for="(hole, idx) in holes" :key="idx" class="cell"
         :style="holeStyle(idx)"
         @click="whack(idx)" @touchstart.prevent="whack(idx)">
      <div class="stone-wrap" :class="{up: hole.active, ['s-'+hole.state]: true}">
        <div class="stone" :style="{background: stoneColor(idx, hole)}">
          <span class="ch">{{ hole.display }}</span>
        </div>
      </div>
      <div v-if="hole.fx" class="fx">
        <span v-for="(p,i) in hole.fx" :key="i" class="fxp" :style="{'--x':p.x+'px','--y':p.y+'px'}">{{p.e}}</span>
      </div>
    </div>

    <!-- 底部：生命 + 进度 -->
    <div class="bot">
      <div class="hearts">
        <span v-for="i in maxLives" :key="i" class="ht" :class="{lost: i > lives, pop: i === lives && justLostLife}">❤️</span>
      </div>
      <div class="prog">{{ correctCount }}/{{ totalQuestions }}</div>
    </div>

    <!-- 结果弹窗 -->
    <transition name="ov">
      <div v-if="gameOver" class="rov">
        <div class="rcard">
          <div class="remo">{{ resultEmoji }}</div>
          <div class="rtit">{{ resultTitle }}</div>
          <div class="rstars"><span v-for="i in 3" :key="i" class="rstar" :class="i <= stars ? 'on' : 'off'" :style="{animationDelay: i * .15 + 's'}">★</span></div>
          <div class="rsts">
            <div class="rs1"><b>{{ accuracyPercent }}%</b><small>正确率</small></div>
            <div class="rdv"></div>
            <div class="rs1"><b>{{ score }}</b><small>得分</small></div>
            <div class="rdv"></div>
            <div class="rs1"><b>{{ maxCombo }}x</b><small>连击</small></div>
          </div>
          <div class="rbtns">
            <button @click="goBack" class="rbtn sec">返回</button>
            <button @click="restart" class="rbtn pri">再来</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const props = defineProps({
  stageId: { type: [Number, String], default: 1 },
  stageConfig: { type: Object, default: null },
  config: { type: Object, default: null },
})
const emit = defineEmits(['game-complete', 'game-exit'])
const router = useRouter()
const gameStore = useGameStore()

const SEION=[{h:'あ',k:'ア',r:'a'},{h:'い',k:'イ',r:'i'},{h:'う',k:'ウ',r:'u'},{h:'え',k:'エ',r:'e'},{h:'お',k:'オ',r:'o'},{h:'か',k:'カ',r:'ka'},{h:'き',k:'キ',r:'ki'},{h:'く',k:'ク',r:'ku'},{h:'け',k:'ケ',r:'ke'},{h:'こ',k:'コ',r:'ko'},{h:'さ',k:'サ',r:'sa'},{h:'し',k:'シ',r:'shi'},{h:'す',k:'ス',r:'su'},{h:'せ',k:'セ',r:'se'},{h:'そ',k:'ソ',r:'so'},{h:'た',k:'タ',r:'ta'},{h:'ち',k:'チ',r:'chi'},{h:'つ',k:'ツ',r:'tsu'},{h:'て',k:'テ',r:'te'},{h:'と',k:'ト',r:'to'},{h:'な',k:'ナ',r:'na'},{h:'に',k:'ニ',r:'ni'},{h:'ぬ',k:'ヌ',r:'nu'},{h:'ね',k:'ネ',r:'ne'},{h:'の',k:'ノ',r:'no'},{h:'は',k:'ハ',r:'ha'},{h:'ひ',k:'ヒ',r:'hi'},{h:'ふ',k:'フ',r:'fu'},{h:'へ',k:'ヘ',r:'he'},{h:'ほ',k:'ホ',r:'ho'},{h:'ま',k:'マ',r:'ma'},{h:'み',k:'ミ',r:'mi'},{h:'む',k:'ム',r:'mu'},{h:'め',k:'メ',r:'me'},{h:'も',k:'モ',r:'mo'},{h:'や',k:'ヤ',r:'ya'},{h:'ゆ',k:'ユ',r:'yu'},{h:'よ',k:'ヨ',r:'yo'},{h:'ら',k:'ラ',r:'ra'},{h:'り',k:'リ',r:'ri'},{h:'る',k:'ル',r:'ru'},{h:'れ',k:'レ',r:'re'},{h:'ろ',k:'ロ',r:'ro'},{h:'わ',k:'ワ',r:'wa'},{h:'を',k:'ヲ',r:'wo'},{h:'ん',k:'ン',r:'n'}]
const DAKUON=[{h:'が',k:'ガ',r:'ga'},{h:'ぎ',k:'ギ',r:'gi'},{h:'ぐ',k:'グ',r:'gu'},{h:'げ',k:'ゲ',r:'ge'},{h:'ご',k:'ゴ',r:'go'},{h:'ざ',k:'ザ',r:'za'},{h:'じ',k:'ジ',r:'ji'},{h:'ず',k:'ズ',r:'zu'},{h:'ぜ',k:'ゼ',r:'ze'},{h:'ぞ',k:'ゾ',r:'zo'},{h:'だ',k:'ダ',r:'da'},{h:'ぢ',k:'ヂ',r:'di'},{h:'づ',k:'ヅ',r:'du'},{h:'で',k:'デ',r:'de'},{h:'ど',k:'ド',r:'do'},{h:'ば',k:'バ',r:'ba'},{h:'び',k:'ビ',r:'bi'},{h:'ぶ',k:'ブ',r:'bu'},{h:'べ',k:'ベ',r:'be'},{h:'ぼ',k:'ボ',r:'bo'},{h:'ぱ',k:'パ',r:'pa'},{h:'ぴ',k:'ピ',r:'pi'},{h:'ぷ',k:'プ',r:'pu'},{h:'ぺ',k:'ペ',r:'pe'},{h:'ぽ',k:'ポ',r:'po'}]

const STAGES={1:{title:'平假名入門',mode:'h2r',kana:SEION.slice(0,25),time:60,q:15},2:{title:'平假名進階',mode:'h2r',kana:SEION.slice(25),time:60,q:15},3:{title:'片假名入門',mode:'k2r',kana:SEION.slice(0,25),time:60,q:15},4:{title:'片假名進階',mode:'k2r',kana:SEION.slice(25),time:60,q:15},5:{title:'濁音挑戰',mode:'h2r',kana:DAKUON,time:75,q:20},6:{title:'混合亂鬥',mode:'mix2r',kana:SEION,time:90,q:25},7:{title:'終極試煉',mode:'h2k',kana:SEION,time:90,q:30}}

const cfg=computed(()=>{
  if(props.stageConfig){const cd=props.stageConfig.config_data||props.stageConfig.game_data||props.stageConfig.configData||{};const p=typeof cd==='string'?JSON.parse(cd):cd;const cs=p.crush_stage||p.crushStage;if(cs&&STAGES[cs])return STAGES[cs]}
  if(props.config?.mode)return props.config;if(props.stageId&&STAGES[props.stageId])return STAGES[props.stageId];return STAGES[1]
})

const STONE_COLORS = [
  'linear-gradient(135deg, #FFE082, #FFD54F, #FFC107)',
  'linear-gradient(135deg, #81D4FA, #4FC3F7, #29B6F6)',
  'linear-gradient(135deg, #A5D6A7, #81C784, #66BB6A)',
  'linear-gradient(135deg, #FFCC80, #FFB74D, #FFA726)',
  'linear-gradient(135deg, #CE93D8, #BA68C8, #AB47BC)',
  'linear-gradient(135deg, #F48FB1, #F06292, #EC407A)',
  'linear-gradient(135deg, #90CAF9, #64B5F6, #42A5F5)',
  'linear-gradient(135deg, #80CBC4, #4DB6AC, #26A69A)',
]

const totalTime=computed(()=>cfg.value.time||60),totalQuestions=computed(()=>cfg.value.q||15)
const maxLives=3,lives=ref(maxLives),score=ref(0),timeLeft=ref(60)
const combo=ref(0),maxCombo=ref(0),correctCount=ref(0),wrongCount=ref(0)
const totalAnswered=computed(()=>correctCount.value+wrongCount.value)
const gameOver=ref(false),gameStarted=ref(false),qIdx=ref(0)
const screenShake=ref(false),justLostLife=ref(false)
const currentTarget=ref(null),targetKey=ref(0)
const holes=ref(Array.from({length:9},()=>({active:false,display:'',kana:null,isCorrect:false,state:'idle',fx:null})))
const progressPercent=computed(()=>Math.min(100,correctCount.value/totalQuestions.value*100))
let timer=null,moleTs=[],pool=[]

// 9个洞的精确位置（百分比，基于1024×1536背景图）
const HOLE_POS = [
  // Row 1
  { left: '21.5%', top: '38.4%' },  // (220,590)
  { left: '48.8%', top: '37.1%' },  // (500,570)
  { left: '76.2%', top: '36.1%' },  // (780,555)
  // Row 2
  { left: '19.0%', top: '55.3%' },  // (195,850)
  { left: '48.8%', top: '54.0%' },  // (500,830)
  { left: '77.1%', top: '52.7%' },  // (790,810)
  // Row 3
  { left: '19.5%', top: '74.2%' },  // (200,1140)
  { left: '49.8%', top: '72.3%' },  // (510,1110)
  { left: '78.1%', top: '70.9%' },  // (800,1090)
]

function holeStyle(idx) {
  const pos = HOLE_POS[idx]
  return {
    position: 'absolute',
    left: pos.left,
    top: pos.top,
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    width: '18%',
    height: '10%',
  }
}

function stoneColor(idx, hole) {
  if (hole.state === 'correct') return 'linear-gradient(135deg, #66BB6A, #43A047)'
  if (hole.state === 'wrong') return 'linear-gradient(135deg, #EF5350, #E53935)'
  return STONE_COLORS[idx % STONE_COLORS.length]
}

const targetDisplay=computed(()=>{if(!currentTarget.value)return '?';const m=cfg.value.mode;if(m==='h2r'||m==='k2r'||m==='mix2r')return currentTarget.value.r;if(m==='h2k')return currentTarget.value.h;return currentTarget.value.r})
function getDisp(k){const m=cfg.value.mode;return m==='h2r'?k.h:m==='k2r'?k.k:m==='mix2r'?(Math.random()>.5?k.h:k.k):m==='h2k'?k.k:k.h}
function genPool(){const kl=cfg.value.kana||SEION,sh=[...kl].sort(()=>Math.random()-.5),p=[];for(let i=0;i<totalQuestions.value;i++)p.push(sh[i%sh.length]);return p.sort(()=>Math.random()-.5)}

function popMoles(){
  if(gameOver.value||!gameStarted.value||qIdx.value>=totalQuestions.value)return
  moleTs.forEach(t=>clearTimeout(t));moleTs=[]
  holes.value.forEach(h=>{h.active=false;h.state='idle';h.fx=null})
  const t=pool[qIdx.value];if(!t)return
  currentTarget.value=t;targetKey.value++
  setTimeout(()=>{
    if(gameOver.value||!gameStarted.value)return
    const indices=[0,1,2,3,4,5,6,7,8]
    const kl=cfg.value.kana||SEION
    const n=Math.min(9,3+Math.floor(qIdx.value/5))
    const sel=indices.sort(()=>Math.random()-.5).slice(0,n)
    const ci=sel[Math.floor(Math.random()*sel.length)]
    sel.forEach(hi=>{const isC=hi===ci;let kana,disp;if(isC){kana=t;disp=getDisp(t)}else{let w;do{w=kl[Math.floor(Math.random()*kl.length)]}while(w.r===t.r);kana=w;disp=getDisp(w)}
      holes.value[hi]={active:true,display:disp,kana,isCorrect:isC,state:'idle',fx:null}
      const d=Math.max(2000,4500-qIdx.value*100)
      moleTs.push(setTimeout(()=>{if(holes.value[hi].active&&holes.value[hi].state==='idle'){if(holes.value[hi].isCorrect)miss();holes.value[hi].active=false}},d))
    })
  },400)
}
function whack(idx){const h=holes.value[idx];if(!h.active||h.state!=='idle'||gameOver.value)return
  if(h.isCorrect){h.state='correct';spawnFx(idx,'ok');combo.value++;if(combo.value>maxCombo.value)maxCombo.value=combo.value;score.value+=10+Math.floor(combo.value/2)*5;correctCount.value++;speak(h.kana)
    setTimeout(()=>{qIdx.value++;if(correctCount.value>=totalQuestions.value||qIdx.value>=totalQuestions.value)endGame();else popMoles()},600)
  }else{h.state='wrong';spawnFx(idx,'no');combo.value=0;wrongCount.value++;lives.value--;justLostLife.value=true;setTimeout(()=>justLostLife.value=false,500);screenShake.value=true;setTimeout(()=>screenShake.value=false,300);setTimeout(()=>{h.state='idle'},400);if(lives.value<=0)setTimeout(endGame,500)}}
function miss(){combo.value=0;wrongCount.value++;qIdx.value++;if(qIdx.value>=totalQuestions.value)setTimeout(endGame,300);else popMoles()}
function spawnFx(idx,type){const ems=type==='ok'?['✨','⭐','🌟','💫','🎉']:['💥','😵','❌'];holes.value[idx].fx=Array.from({length:type==='ok'?6:4},(_,i)=>{const a=(360/(type==='ok'?6:4))*i*(Math.PI/180),d=20+Math.random()*25;return{e:ems[i%ems.length],x:Math.cos(a)*d,y:Math.sin(a)*d-15}});setTimeout(()=>{if(holes.value[idx])holes.value[idx].fx=null},700)}
function speak(k){if(!k)return;try{const a=new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(k.h||k.k)}`);a.volume=.5;a.play().catch(()=>{})}catch(e){}}

function startGame(){gameOver.value=false;gameStarted.value=true;score.value=0;lives.value=maxLives;combo.value=0;maxCombo.value=0;correctCount.value=0;wrongCount.value=0;qIdx.value=0;timeLeft.value=totalTime.value;holes.value.forEach(h=>{h.active=false;h.state='idle';h.fx=null});pool=genPool();timer=setInterval(()=>{if(gameOver.value)return;timeLeft.value--;if(timeLeft.value<=0)endGame()},1000);setTimeout(popMoles,800)}
function endGame(){if(gameOver.value)return;gameOver.value=true;gameStarted.value=false;clearInterval(timer);moleTs.forEach(t=>clearTimeout(t));moleTs=[];holes.value.forEach(h=>{h.active=false});submitResult()}
function restart(){startGame()}
function goBack(){clearInterval(timer);moleTs.forEach(t=>clearTimeout(t));emit('game-exit');router.back()}

const accuracyPercent=computed(()=>totalAnswered.value===0?0:Math.round(correctCount.value/totalAnswered.value*100))
const stars=computed(()=>{const a=accuracyPercent.value/100;if(a>=.9&&lives.value>=maxLives)return 3;if(a>=.7)return 2;if(a>=.4||correctCount.value>0)return 1;return 0})
const resultEmoji=computed(()=>stars.value>=3?'🏆':stars.value>=2?'🎉':stars.value>=1?'👏':'💪')
const resultTitle=computed(()=>stars.value>=3?'完美通关！':stars.value>=2?'做得不错！':stars.value>=1?'继续加油！':'再练练吧')
async function submitResult(){try{await gameStore.submitStageResult({stageId:props.stageId,stars:stars.value,score:score.value,accuracy:accuracyPercent.value/100,timeTaken:totalTime.value-timeLeft.value,combo:maxCombo.value});emit('game-complete',{stars:stars.value,score:score.value})}catch(e){console.error(e);emit('game-complete',{stars:stars.value,score:score.value})}}
onMounted(()=>startGame());onUnmounted(()=>{clearInterval(timer);moleTs.forEach(t=>clearTimeout(t))})
</script>

<style scoped>
.game {
  height: 100vh; height: 100dvh;
  overflow: hidden; -webkit-user-select: none; user-select: none;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
}
.shaking { animation: shk .25s; }
@keyframes shk { 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} }

/* 全屏背景 */
.bg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: fill; z-index: 0;
}

/* HUD 药丸 */
.hud {
  position: absolute; top: 7.5%; left: 50%; transform: translateX(-50%);
  z-index: 20; display: flex; gap: 0;
}
.pill {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 14px; font-size: 15px; font-weight: 900;
  color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
.score { background: linear-gradient(135deg, #37474F, #546E7A); border-radius: 16px 0 0 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.timer { background: linear-gradient(135deg, #5D4037, #795548); border-radius: 0 16px 16px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.timer.warn { background: linear-gradient(135deg, #C62828, #E53935); animation: pls 1s infinite; }
@keyframes pls { 50% { opacity: 0.7; } }

/* 目标提示 */
.target {
  position: absolute; top: 12.5%; left: 50%; transform: translateX(-50%);
  z-index: 20;
}
.target-inner {
  display: inline-block;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  padding: 5px 18px; border-radius: 14px;
  font-size: 14px; color: #5D4037; font-weight: 600;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}
.target-inner b { font-size: 19px; color: #E53935; font-weight: 900; }

.pop-enter-active { animation: pI .25s cubic-bezier(.34,1.56,.64,1); }
.pop-leave-active { animation: pO .12s ease-in; }
@keyframes pI { from{transform:scale(.3);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes pO { to{transform:scale(.5);opacity:0} }

/* Combo */
.combo {
  position: absolute; top: 17%; right: 10px; z-index: 25;
  background: linear-gradient(135deg, #FF6D00, #FF9100);
  color: white; font-size: 15px; font-weight: 900;
  padding: 4px 12px; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255,109,0,0.4);
}
.cpop-enter-active { animation: cpo .3s cubic-bezier(.34,1.56,.64,1); }
.cpop-leave-active { transition: all .2s; }
.cpop-leave-to { opacity: 0; transform: scale(.5); }
@keyframes cpo { from{transform:scale(0)} to{transform:scale(1)} }

/* ========== 洞口格子 ========== */
.cell {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.cell:active .stone-wrap.up .stone { transform: scale(0.85); }

/* 石碑 */
.stone-wrap {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, 80%);
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
  z-index: 2;
}
.stone-wrap.up { transform: translate(-50%, -60%); }

.stone {
  width: 56px; height: 50px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.2);
  transition: transform .15s, background .2s;
}
.stone::before {
  content: ''; position: absolute;
  top: 3px; left: 6px; right: 6px; height: 5px;
  background: rgba(255,255,255,0.3); border-radius: 4px;
}
.ch {
  font-size: 24px; font-weight: 900; color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* 特效 */
.fx { position: absolute; inset: 0; z-index: 25; pointer-events: none; display: flex; align-items: center; justify-content: center; }
.fxp { position: absolute; font-size: 14px; animation: sf .6s ease-out forwards; }
@keyframes sf { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--x),var(--y)) scale(.2);opacity:0} }

/* 底部 */
.bot {
  position: absolute; bottom: 2%; left: 50%; transform: translateX(-50%);
  z-index: 20; display: flex; align-items: center; gap: 12px;
}
.hearts { display: flex; gap: 2px; }
.ht { font-size: 18px; transition: all .3s; }
.ht.lost { transform: scale(.4); filter: grayscale(1); opacity: .2; }
.ht.pop { animation: hp .4s; }
@keyframes hp { 25%{transform:scale(1.5) rotate(-12deg)} 50%{transform:scale(.7)} 75%{transform:scale(1.15)} }
.prog {
  font-size: 15px; font-weight: 900; color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  background: rgba(0,0,0,0.3); padding: 3px 12px; border-radius: 10px;
}

/* 结果 */
.rov { position: absolute; inset: 0; z-index: 50; background: rgba(0,0,0,.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.rcard { background: white; border-radius: 20px; padding: 24px; width: 100%; max-width: 320px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,.2); }
.remo { font-size: 48px; margin-bottom: 4px; }
.rtit { font-size: 22px; font-weight: 800; color: #333; margin-bottom: 10px; }
.rstars { display: flex; justify-content: center; gap: 4px; margin-bottom: 14px; }
.rstar { font-size: 32px; animation: stp .4s cubic-bezier(.34,1.56,.64,1) both; }
.rstar.on { color: #FFD93D; text-shadow: 0 2px 4px rgba(255,217,61,.4); }
.rstar.off { color: #E5E5E5; }
@keyframes stp { from{transform:scale(0) rotate(-180deg);opacity:0} to{transform:scale(1) rotate(0);opacity:1} }
.rsts { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 18px; }
.rs1 { text-align: center; }
.rs1 b { display: block; font-size: 18px; color: #333; }
.rs1 small { font-size: 11px; color: #999; }
.rdv { width: 1px; height: 24px; background: #E5E5E5; }
.rbtns { display: flex; gap: 8px; }
.rbtn { flex: 1; padding: 13px; border-radius: 14px; border: none; font-size: 15px; font-weight: 700; cursor: pointer; }
.rbtn:active { transform: scale(.96); }
.rbtn.sec { background: #F0F0F0; color: #666; }
.rbtn.pri { background: #58CC02; color: white; box-shadow: 0 4px 0 #46a302; }
.rbtn.pri:active { box-shadow: 0 2px 0 #46a302; transform: translateY(2px); }
.ov-enter-active { transition: all .3s; } .ov-leave-active { transition: all .2s; }
.ov-enter-from, .ov-leave-to { opacity: 0; }
.ov-enter-from .rcard { transform: scale(.8) translateY(20px); }
</style>
