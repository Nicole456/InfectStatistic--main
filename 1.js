const fs = require('fs')
const readline = require('readline')
const MONTH = [0,31,28,30]
const provinces = new Set()
const total = {
   inf:{}, sus:{}, dead:{}, cure:{},
}
const result = {}
const cmdParam = {
   log:[], out:[], date:[], type:[], province:[],
}
var argv = process.argv.slice(2)
var reading = ''
function appendData(date){
   var fileName = date + '.log.txt'
   if(!fs.existsSync(fileName)) return
   var data = fs.readFileSync(fileName ,'utf-8')
   data = data.split('\n')
   data.forEach((line)=>{
      var res = []
      function match(reg, hasTwoPvovince){  //用于匹配正则，清洗数据以及初始化
         if(/\/\//.test(line)) return false //如果是注释，忽略掉
         var res = reg.exec(line)   
         if(!res) return 
         for(key of Object.keys(total)){
            if(!total[key][res[1]]){
               provinces.add(res[1])
               total[key][res[1]] = 0
            } 
            if(hasTwoPvovince && !total[key][res[2]]){
               provinces.add(res[2])
               total[key][res[2]] = 0
            }
         }  //初始化数据数字为Number类型，防止NaN
         return res.slice(1,4)
      }
      if(res = match(/(\S{2,3})\s新增 感染患者 (\d*)人/g))
         total.inf[res[0]] += Number(res[1])
      if(res = match(/(\S{2,3})\s新增 疑似患者 (\d*)人/g))
         total.sus[res[0]] += Number(res[1])
      if(res = match(/(\S{2,3})\s疑似患者 流入 (\S{2,3})\s(\d*)人/g, true)){
         total.sus[res[0]] -= Number(res[2])
         total.sus[res[1]] += Number(res[2])
      }
      if(res = match(/(\S{2,3})\s感染患者 流入 (\S{2,3})\s(\d*)人/g, true)){
         total.inf[res[0]] -= Number(res[2])
         total.inf[res[1]] += Number(res[2])
      }
      if(res = match(/(\S{2,3})\s死亡 (\d*)人/g)){
         total.inf[res[0]] -= Number(res[1])
         total.dead[res[0]] += Number(res[1])
      }
      if(res = match(/(\S{2,3})\s治愈 (\d*)人/g)){
         total.cure[res[0]] += Number(res[1])
         total.inf[res[0]] -= Number(res[1])
      }
      if(res = match(/(\S{2,3})\s疑似患者 确诊感染 (\d*)人/g)){
         total.inf[res[0]] += Number(res[1])
         total.sus[res[0]] -= Number(res[1])
      }
      if(res = match(/(\S{2,3})\s排除 疑似患者 (\d*)人/g))
         total.sus[res[0]] -= Number(res[1])
   })
}
function listOut(content){
   console.log(content)
}
(function main(){
   argv.slice(1).forEach(v=>{
      var checked = false  //checked为true，说明该参数是一个key
      for(item of Object.keys(cmdParam))
         if(v == '-'+item){
            reading = item
            checked = true
            break
         }
      !checked && cmdParam[reading].push(v) //统计键值对
   })
   if(!(cmdParam.log = cmdParam.log[0])){ //没有指定日期的话
      var today = new Date()
      var [y,m,d] = [today.getFullYear(),today.getMonth(),today.getDay()]
   }else{
      var [y,m,d] = cmdParam.log.split('-')
   }
   for(var i=1;i<=m;i++) //不循环年份，因为19年没有这个病毒，否则你会被叫去喝茶
      for(var j=1;j<=(j!=m?MONTH[i]:d);j++){
         appendData(`2020-${i<=9?'0'+i:i}-${j<=9?'0'+j:j}`)
      }
   var provincesSorted = []
   for(let item of provinces.keys()){ //提取集合里的省份
      provincesSorted.push(item)
   }
   provincesSorted = provincesSorted.sort((a,b)=>{
      return a.localeCompare(b,'zh');
   })
   for(let item of Object.keys(total)){  //统计'全国'
      let sum = 0
      for(let num of Object.values(total[item]))
         sum += num
      total[item]['全国'] = sum
   }
   if(!type.length) type = ['ip','sp','cure','dead']
   provincesSorted.forEach((v)=>{
      listOut(`${v} 感染患者${total.inf[v]}人 疑似患者${total.sus[v]}人 治愈${total.cure[v]}人 死亡${total.dead[v]}人`)
   })
   //开始处理输出数据的附加项
})()

//console.dir(cmdParam)
/*process.on('uncaughtException', (e)=>{
   console.error('错误：', e.message)
})
if(argv[0]!='list')
   throw new Error('命令仅可以接收list！')*/ //抛错用，似乎不需要