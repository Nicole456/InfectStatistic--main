var a = ''
var time = 10
var fs = require('fs')
const p = ['台湾','北京','天津','上海','重庆','河北','山西','辽宁','吉林',
'黑龙江','江苏','浙江','安徽','福建','江西','山东',
'河南','湖北','湖南','广东','海南','四川','贵州',
'云南','陕西','甘肃','青海','内蒙古','广西','西藏','宁夏','新疆','香港','澳门']
const type = []
function get(n){
   return parseInt(n/10)==0?1:parseInt(n/10)
}
for(;time<=20;time++){
   a = ''
   for(i=1;i<=25;i++){
      let ran = Math.floor(Math.random()*(p.length-1))
      let ran2 = Math.floor(Math.random()*(p.length-1))
      let n = Math.floor(Math.random()*(100))
      if(ran==0)
         n = Math.floor(Math.random()*(20000))+2000
      let ran4 = Math.floor(Math.random()*(83))
      if(ran4>=0&&ran4<=35)
         a+=`${p[ran]} 新增 感染患者 ${n}人`
      if(ran4>=36&&ran4<=70)
         a+=`${p[ran]} 新增 疑似患者 ${n}人`
      if(ran4>=71&&ran4<=72)
         a+=`${p[ran]} 死亡 ${get(n)}人`
      if(ran4>=73&&ran4<=74)
         a+=`${p[ran]} 治愈 ${get(n)}人`
      if(ran4>=75&&ran4<=76)
         a+=`${p[ran]} 疑似患者 确诊感染 ${get(n)}人`
      if(ran4>=77&&ran4<=78)
         a+=`${p[ran]} 排除 疑似患者 ${get(n)}人`
      if(ran4>=79&&ran4<=80)
         a+=`${p[ran]} 感染患者 流入 ${p[ran2]} ${get(n)}人`
      if(ran4>=81&&ran4<=82)
         a+=`${p[ran]} 疑似患者 流入 ${p[ran2]} ${get(n)}人`
      a+='\n'
   }
   
   
   fs.writeFileSync('log/2020-01-'+time+'.log.txt', a, 'utf-8')

}
