<template>
  <div class="game" :class="{ shaking: screenShake }" @touchmove.prevent>
    
    <!-- 背景 -->
    <div class="bg">
      <div class="sky"></div>
      <svg class="mtns" viewBox="0 0 430 100" preserveAspectRatio="none">
        <path d="M0 100 L50 30 L100 70 L160 15 L220 60 L280 20 L340 55 L430 10 L430 100Z" fill="#C5CAE9" opacity="0.4"/>
        <path d="M0 100 L70 50 L140 80 L200 35 L270 65 L350 25 L430 50 L430 100Z" fill="#A5D6A7" opacity="0.5"/>
      </svg>
      <div class="hills"></div>
      <div class="fence"><span v-for="i in 12" :key="i" class="fp"></span></div>
      <div class="grass"></div>
    </div>

    <!-- 装饰 -->
    <div class="dc d1">🍄</div><div class="dc d2">🍄</div>
    <div class="dc d3">🌳</div><div class="dc d4">🌲</div>
    <div class="dc d5">🏡</div><div class="dc d6">🪵</div>
    <div class="dc d7">🌸</div><div class="dc d8">🌼</div>

    <!-- HUD -->
    <div class="hud">
      <button @click="goBack" class="hx">✕</button>
      <div class="hbar"><div class="hfill" :style="{width:progressPercent+'%'}"></div></div>
      <span class="hcnt">{{correctCount}}/{{totalQuestions}}</span>
      <div class="hhearts">
        <span v-for="i in maxLives" :key="i" class="hh" :class="{lost:i>lives,pop:i===lives&&justLostLife}">❤️</span>
      </div>
    </div>

    <!-- 大木牌（竖在草地上） -->
    <div class="sign">
      <div class="sign-board" :class="{pulse:targetPulse}">
        <transition name="pop" mode="out-in">
          <span class="sign-ch" :key="targetKey">{{targetDisplay}}</span>
        </transition>
        <span class="sign-hint">{{targetHint}}</span>
      </div>
      <div class="sign-pole"></div>
      <div class="sign-pole"></div>
    </div>

    <!-- Combo -->
    <transition name="cpop">
      <div v-if="combo>=2" class="combo" :key="combo">🔥 {{combo}}x</div>
    </transition>

    <!-- 计时 -->
    <div class="tmr" :class="{warn:timeLeft<=10}">⏱️ {{timeLeft}}</div>

    <!-- 3×3 网格 —— 嵌在草地里 -->
    <div class="field">
      <div class="grid">
        <div v-for="(hole, idx) in holes" :key="idx" class="cell" @click="whack(idx)" @touchstart.prevent="whack(idx)">
          <!-- 洞口 -->
          <div class="pit">
            <!-- 泥土洞 SVG -->
            <svg class="hole-svg" viewBox="0 0 120 90" preserveAspectRatio="none">
              <!-- 外层泥土堆 -->
              <ellipse cx="60" cy="50" rx="58" ry="38" fill="#8B6914"/>
              <ellipse cx="60" cy="48" rx="56" ry="36" fill="#A67C00"/>
              <!-- 泥土纹理 -->
              <ellipse cx="35" cy="42" rx="8" ry="4" fill="#C49B2A" opacity="0.3"/>
              <ellipse cx="80" cy="44" rx="6" ry="3" fill="#C49B2A" opacity="0.25"/>
              <ellipse cx="55" cy="38" rx="10" ry="3" fill="#BF8C2C" opacity="0.2"/>
              <!-- 洞口阴影 -->
              <ellipse cx="60" cy="48" rx="42" ry="28" fill="#5D4037"/>
              <ellipse cx="60" cy="46" rx="40" ry="26" fill="#3E2723"/>
              <!-- 洞底深处 -->
              <ellipse cx="60" cy="44" rx="34" ry="22" fill="#1A0E00"/>
              <ellipse cx="60" cy="42" rx="28" ry="16" fill="#0D0700" opacity="0.6"/>
              <!-- 泥土高光 -->
              <ellipse cx="40" cy="36" rx="12" ry="4" fill="#D4A54A" opacity="0.15"/>
            </svg>
            <!-- 地鼠（从洞里往上冒） -->
            <div class="mole" :class="{up:hole.active, ['s-'+hole.state]:true}">
              <!-- 气泡 -->
              <div v-if="hole.active" class="bub" :class="'bub-'+hole.state">
                <span class="bub-ch">{{hole.display}}</span>
              </div>
              <!-- SVG角色 -->
              <svg viewBox="0 0 80 70" class="msv">
                <ellipse cx="40" cy="50" rx="26" ry="20" :fill="mc(hole.state)"/>
                <ellipse cx="40" cy="54" rx="16" ry="13" fill="#FFECD2" opacity="0.6"/>
                <ellipse cx="40" cy="26" rx="22" ry="20" :fill="mc(hole.state)"/>
                <ellipse cx="22" cy="10" rx="8" ry="7" :fill="mc(hole.state)"/>
                <ellipse cx="22" cy="10" rx="5" ry="4.5" fill="#FFDAB9"/>
                <ellipse cx="58" cy="10" rx="8" ry="7" :fill="mc(hole.state)"/>
                <ellipse cx="58" cy="10" rx="5" ry="4.5" fill="#FFDAB9"/>
                <circle cx="22" cy="30" r="4.5" fill="#FFB6C1" opacity="0.5"/>
                <circle cx="58" cy="30" r="4.5" fill="#FFB6C1" opacity="0.5"/>
                <template v-if="hole.state==='wrong'">
                  <text x="32" y="27" font-size="9" font-weight="900" fill="#C62828" text-anchor="middle">✕</text>
                  <text x="48" y="27" font-size="9" font-weight="900" fill="#C62828" text-anchor="middle">✕</text>
                </template>
                <template v-else-if="hole.state==='correct'">
                  <path d="M27 24 Q32 20 37 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
                  <path d="M43 24 Q48 20 53 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
                </template>
                <template v-else>
                  <ellipse cx="32" cy="23" rx="4" ry="5" fill="white"/>
                  <ellipse cx="48" cy="23" rx="4" ry="5" fill="white"/>
                  <circle cx="33" cy="24" r="2.5" fill="#333"/>
                  <circle cx="49" cy="24" r="2.5" fill="#333"/>
                  <circle cx="33.6" cy="22.5" r=".9" fill="white"/>
                  <circle cx="49.6" cy="22.5" r=".9" fill="white"/>
                </template>
                <ellipse cx="40" cy="30" rx="3.5" ry="2.5" fill="#D4956A"/>
                <ellipse cx="40" cy="29.5" rx="1.8" ry=".8" fill="#FFDAB9" opacity="0.6"/>
                <line x1="18" y1="28" x2="28" y2="30" stroke="#C4A882" stroke-width=".7" opacity=".5"/>
                <line x1="18" y1="32" x2="28" y2="32" stroke="#C4A882" stroke-width=".7" opacity=".5"/>
                <line x1="52" y1="30" x2="62" y2="28" stroke="#C4A882" stroke-width=".7" opacity=".5"/>
                <line x1="52" y1="32" x2="62" y2="32" stroke="#C4A882" stroke-width=".7" opacity=".5"/>
                <template v-if="hole.state==='correct'">
                  <path d="M34 35 Q40 42 46 35" fill="#FF8A80" stroke="#333" stroke-width=".8"/>
                </template>
                <template v-else-if="hole.state==='wrong'">
                  <ellipse cx="40" cy="37" rx="3.5" ry="4" fill="#333"/>
                </template>
                <template v-else>
                  <path d="M36 34 Q40 38 44 34" fill="none" stroke="#333" stroke-width="1" stroke-linecap="round"/>
                  <rect x="38.5" y="34" width="1.5" height="2.5" rx=".5" fill="white" stroke="#eee" stroke-width=".2"/>
                  <rect x="40" y="34" width="1.5" height="2.5" rx=".5" fill="white" stroke="#eee" stroke-width=".2"/>
                </template>
                <ellipse cx="18" cy="50" rx="5" ry="3.5" fill="#FFDAB9" transform="rotate(-10,18,50)"/>
                <ellipse cx="62" cy="50" rx="5" ry="3.5" fill="#FFDAB9" transform="rotate(10,62,50)"/>
              </svg>
            </div>
          </div>
          <!-- 草地遮挡边缘 -->
          <div class="rim"></div>
          <!-- 特效 -->
          <div v-if="hole.fx" class="fx">
            <span v-for="(p,i) in hole.fx" :key="i" class="fxp" :style="{'--x':p.x+'px','--y':p.y+'px'}">{{p.e}}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果 -->
    <transition name="ov">
      <div v-if="gameOver" class="rov">
        <div class="rcard">
          <div class="remo">{{resultEmoji}}</div>
          <div class="rtit">{{resultTitle}}</div>
          <div class="rstars"><span v-for="i in 3" :key="i" class="rstar" :class="i<=stars?'on':'off'" :style="{animationDelay:i*.15+'s'}">★</span></div>
          <div class="rsts">
            <div class="rs1"><b>{{accuracyPercent}}%</b><small>正确率</small></div>
            <div class="rdv"></div>
            <div class="rs1"><b>{{score}}</b><small>得分</small></div>
            <div class="rdv"></div>
            <div class="rs1"><b>{{maxCombo}}x</b><small>连击</small></div>
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

const totalTime=computed(()=>cfg.value.time||60),totalQuestions=computed(()=>cfg.value.q||15)
const maxLives=3,lives=ref(maxLives),score=ref(0),timeLeft=ref(60)
const combo=ref(0),maxCombo=ref(0),correctCount=ref(0),wrongCount=ref(0)
const totalAnswered=computed(()=>correctCount.value+wrongCount.value)
const gameOver=ref(false),gameStarted=ref(false),qIdx=ref(0)
const screenShake=ref(false),justLostLife=ref(false),targetPulse=ref(false)
const currentTarget=ref(null),targetKey=ref(0)
const holes=ref(Array.from({length:9},()=>({active:false,display:'',kana:null,isCorrect:false,state:'idle',fx:null})))
const progressPercent=computed(()=>Math.min(100,correctCount.value/totalQuestions.value*100))
let timer=null,moleTs=[],pool=[]

function mc(s){return s==='correct'?'#81C784':s==='wrong'?'#EF9A9A':'#D4A574'}
const targetDisplay=computed(()=>{if(!currentTarget.value)return '?';const m=cfg.value.mode;if(m==='h2r'||m==='k2r'||m==='mix2r')return currentTarget.value.r;if(m==='h2k')return currentTarget.value.h;return currentTarget.value.r})
const targetHint=computed(()=>{const m=cfg.value.mode;return m==='h2r'?'👆拍平假名':m==='k2r'?'👆拍片假名':m==='mix2r'?'👆拍假名':m==='h2k'?'👆拍片假名':''})
function getDisp(k){const m=cfg.value.mode;return m==='h2r'?k.h:m==='k2r'?k.k:m==='mix2r'?(Math.random()>.5?k.h:k.k):m==='h2k'?k.k:k.h}
function genPool(){const kl=cfg.value.kana||SEION,sh=[...kl].sort(()=>Math.random()-.5),p=[];for(let i=0;i<totalQuestions.value;i++)p.push(sh[i%sh.length]);return p.sort(()=>Math.random()-.5)}

function popMoles(){
  if(gameOver.value||!gameStarted.value||qIdx.value>=totalQuestions.value)return
  // 先清掉所有旧地鼠和旧定时器，防止新旧混在一起
  moleTs.forEach(t=>clearTimeout(t));moleTs=[]
  holes.value.forEach(h=>{h.active=false;h.state='idle';h.fx=null})
  const t=pool[qIdx.value];if(!t)return
  // 设置新目标
  currentTarget.value=t;targetKey.value++
  targetPulse.value=true;setTimeout(()=>targetPulse.value=false,400)
  // 延迟一小段让玩家先看清罗马音
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
.game{height:100vh;height:100dvh;display:flex;flex-direction:column;overflow:hidden;-webkit-user-select:none;user-select:none;position:relative}
.shaking{animation:shk .25s}
@keyframes shk{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}

/* ========== 背景 ========== */
.bg{position:absolute;inset:0;z-index:0}
.sky{position:absolute;top:0;left:0;right:0;height:30%;background:linear-gradient(180deg,#B39DDB 0%,#90CAF9 30%,#B2EBF2 60%,#C8E6C9 100%)}
.mtns{position:absolute;top:18%;left:0;width:100%;height:13%;z-index:1}
.hills{position:absolute;top:26%;left:0;right:0;height:10%;background:linear-gradient(180deg,#81C784,#66BB6A);border-radius:50% 50% 0 0/100% 100% 0 0;z-index:2}
.fence{position:absolute;top:32%;left:5%;right:5%;height:12px;display:flex;gap:3px;z-index:3}
.fp{flex:1;background:linear-gradient(180deg,#8D6E63,#6D4C41);border-radius:2px 2px 0 0;position:relative}
.fp::before{content:'';position:absolute;top:30%;left:-2px;right:-2px;height:2px;background:#A1887F}
.fp::after{content:'';position:absolute;top:65%;left:-2px;right:-2px;height:2px;background:#A1887F}
.grass{position:absolute;top:34%;left:0;right:0;bottom:0;background:linear-gradient(180deg,#7CB342 0%,#689F38 20%,#558B2F 50%,#4CAF50 100%);z-index:4}

/* 装饰 */
.dc{position:absolute;z-index:5;filter:drop-shadow(0 1px 2px rgba(0,0,0,.15))}
.d1{top:30%;left:3%;font-size:1.2rem}.d2{top:32%;right:4%;font-size:1rem}
.d3{top:28%;left:6%;font-size:1.6rem}.d4{top:29%;right:8%;font-size:1.3rem}
.d5{top:31%;right:14%;font-size:1rem;opacity:.5}.d6{bottom:4%;right:3%;font-size:.9rem;opacity:.5}
.d7{top:38%;left:2%;font-size:.7rem;animation:sw 3s ease-in-out infinite alternate}
.d8{bottom:10%;right:2%;font-size:.5rem;animation:sw 3s ease-in-out infinite alternate 1s}
@keyframes sw{0%{transform:rotate(-5deg)}100%{transform:rotate(5deg)}}

/* ========== HUD ========== */
.hud{display:flex;align-items:center;gap:6px;padding:8px 12px 4px;background:rgba(255,255,255,.88);backdrop-filter:blur(6px);position:relative;z-index:20}
.hx{width:24px;height:24px;border:2px solid #ddd;border-radius:50%;background:white;color:#aaa;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0}
.hx:active{opacity:.4}
.hbar{flex:1;height:10px;background:#E8E8E8;border-radius:5px;overflow:hidden}
.hfill{height:100%;background:linear-gradient(90deg,#58CC02,#78E008);border-radius:5px;transition:width .3s;box-shadow:inset 0 -2px 0 rgba(0,0,0,.1)}
.hcnt{font-size:11px;color:#888;font-weight:700;flex-shrink:0}
.hhearts{display:flex;gap:1px;flex-shrink:0}
.hh{font-size:14px;transition:all .3s}.hh.lost{transform:scale(.6);filter:grayscale(1);opacity:.25}.hh.pop{animation:hp .4s}
@keyframes hp{25%{transform:scale(1.5) rotate(-12deg)}50%{transform:scale(.7)}75%{transform:scale(1.15)}}

/* ========== 大木牌（草坪分界中间） ========== */
.sign{position:absolute;top:18%;left:50%;transform:translateX(-50%);z-index:15;display:flex;flex-direction:column;align-items:center}
.sign-board{
  background:linear-gradient(180deg,#FFECB3,#FFD54F,#FFB300);
  border:4px solid #8B6914;border-radius:14px;
  padding:8px 18px 6px;min-width:70px;text-align:center;
  box-shadow:0 4px 12px rgba(0,0,0,.3),inset 0 2px 0 rgba(255,255,255,.4);
  position:relative;
}
.sign-board::before{content:'';position:absolute;top:4px;left:8px;right:8px;height:3px;background:rgba(139,105,20,.12);border-radius:2px}
.sign-board::after{content:'';position:absolute;bottom:4px;left:8px;right:8px;height:3px;background:rgba(139,105,20,.12);border-radius:2px}
.sign-board.pulse{animation:spp .4s}@keyframes spp{50%{transform:scale(1.08)}}
.sign-ch{font-size:36px;font-weight:900;color:#5D4037;line-height:1.2;display:block}
.sign-hint{font-size:11px;color:#8D6E63;font-weight:700;margin-top:2px;display:block}
.sign-pole{width:7px;height:22px;background:linear-gradient(90deg,#6D4C41,#8B6914,#6D4C41);margin:0 8px}

.pop-enter-active{animation:pI .25s cubic-bezier(.34,1.56,.64,1)}.pop-leave-active{animation:pO .12s ease-in}
@keyframes pI{from{transform:scale(.3) rotateY(90deg);opacity:0}to{transform:scale(1) rotateY(0);opacity:1}}
@keyframes pO{to{transform:scale(.5) rotateY(-90deg);opacity:0}}

/* Combo & Timer */
.combo{position:absolute;top:48px;left:12px;z-index:15;background:linear-gradient(135deg,#FF6B00,#FF9800);color:white;font-size:13px;font-weight:800;padding:3px 10px;border-radius:10px}
.cpop-enter-active{animation:cpo .3s cubic-bezier(.34,1.56,.64,1)}.cpop-leave-active{transition:all .2s}.cpop-leave-to{opacity:0;transform:scale(.5)}
@keyframes cpo{from{transform:scale(0)}to{transform:scale(1)}}
.tmr{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);z-index:15;background:rgba(0,0,0,.3);backdrop-filter:blur(4px);border-radius:14px;padding:3px 12px;color:white;font-size:14px;font-weight:700}
.tmr.warn{background:rgba(255,0,0,.4);animation:pls 1s infinite}@keyframes pls{50%{opacity:.6}}

/* ========== 3×3 网格 ========== */
.field{position:absolute;top:24%;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;z-index:10;padding:0 8px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:18px 6px;width:100%;max-width:330px;height:auto;max-height:500px}

/* 每个格子 */
.cell{position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;aspect-ratio:1}
.cell:active .mole.up .msv{transform:scale(.9)}

/* ========== 洞口 ========== */
.pit{
  position:absolute;
  bottom:2%;left:4%;right:4%;
  height:80%;
  clip-path:inset(-60% -10% 0 -10%);
}
.hole-svg{
  position:absolute;bottom:0;left:0;width:100%;height:80%;
  z-index:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.2));
}

/* 地鼠 */
.mole{
  position:absolute;
  bottom:8%;left:10%;right:10%;
  display:flex;flex-direction:column;align-items:center;
  transform:translateY(120%);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
  z-index:2;
}
.mole.up{transform:translateY(-15%)}
.msv{width:80%;max-width:75px;transition:transform .15s}

/* 草地遮挡边缘 */
.rim{
  position:absolute;
  bottom:-2%;left:0;right:0;
  height:20%;
  background:radial-gradient(ellipse at center top, transparent 50%, #689F38 52%, #558B2F 100%);
  border-radius:50%;
  z-index:4;
  pointer-events:none;
}

/* 气泡 */
.bub{
  width:46px;height:46px;border-radius:50%;
  background:white;border:3px solid #E0E0E0;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 3px 8px rgba(0,0,0,.2);
  margin-bottom:-10px;z-index:6;
  animation:bI .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes bI{from{transform:scale(0)}to{transform:scale(1)}}
.bub-ch{font-size:24px;font-weight:900;color:#E53935}
.bub-correct{border-color:#4CAF50;background:#E8F5E9}.bub-correct .bub-ch{color:#2E7D32}
.bub-wrong{border-color:#F44336;background:#FFEBEE}.bub-wrong .bub-ch{color:#C62828}

/* 特效 */
.fx{position:absolute;inset:0;z-index:25;pointer-events:none;display:flex;align-items:center;justify-content:center}
.fxp{position:absolute;font-size:14px;animation:sf .6s ease-out forwards}
@keyframes sf{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--x),var(--y)) scale(.2);opacity:0}}

/* ========== 结果 ========== */
.rov{position:absolute;inset:0;z-index:50;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px}
.rcard{background:white;border-radius:20px;padding:24px;width:100%;max-width:320px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.2)}
.remo{font-size:48px;margin-bottom:4px}.rtit{font-size:22px;font-weight:800;color:#333;margin-bottom:10px}
.rstars{display:flex;justify-content:center;gap:4px;margin-bottom:14px}
.rstar{font-size:32px;animation:stp .4s cubic-bezier(.34,1.56,.64,1) both}
.rstar.on{color:#FFD93D;text-shadow:0 2px 4px rgba(255,217,61,.4)}.rstar.off{color:#E5E5E5}
@keyframes stp{from{transform:scale(0) rotate(-180deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.rsts{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:18px}
.rs1{text-align:center}.rs1 b{display:block;font-size:18px;color:#333}.rs1 small{font-size:11px;color:#999}
.rdv{width:1px;height:24px;background:#E5E5E5}
.rbtns{display:flex;gap:8px}
.rbtn{flex:1;padding:13px;border-radius:14px;border:none;font-size:15px;font-weight:700;cursor:pointer}
.rbtn:active{transform:scale(.96)}.rbtn.sec{background:#F0F0F0;color:#666}
.rbtn.pri{background:#58CC02;color:white;box-shadow:0 4px 0 #46a302}
.rbtn.pri:active{box-shadow:0 2px 0 #46a302;transform:translateY(2px)}
.ov-enter-active{transition:all .3s}.ov-leave-active{transition:all .2s}
.ov-enter-from,.ov-leave-to{opacity:0}.ov-enter-from .rcard{transform:scale(.8) translateY(20px)}
</style>
