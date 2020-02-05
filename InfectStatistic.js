const fs = require('fs') 
const readline = require('readline')  //读写文件的自带库
const MONTH = [0,31,28,30]  //月份常量
const provinces = new Set()  //存放省份的集合
const total = {  //存放统计数据
   ip:{}, sp:{}, dead:{}, cure:{},
}
const cmdParam = {  //存放命令参数
   log:[], out:[], date:[], type:[], province:[],
}
var reading = '', 
    article = '',
    argv = process.argv.slice(2) 
    cmd = argv.join(' ')
function appendData(date){
   var fileName = cmdParam.log[0] + date + '.log.txt' //组合文件
   if(!fs.existsSync(fileName)) return  //如果没有对应日期的文件，就忽略 
   var data = fs.readFileSync(fileName ,'utf-8')  //效率非常低的同步读取
   data = data.split('\n')   //分行
   data.forEach((line)=>{
      var res = []
      function match(reg, hasTwoPvovince){ //用于匹配正则，清洗数据以及初始化
         if(/\/\//.test(line)) return false //如果是注释，忽略掉
         var res = reg.exec(line)   
         if(!res) return 
         for(key of Object.keys(total)){ //初始化数据数字为Number类型，防止NaN
            if(!total[key][res[1]]){
               provinces.add(res[1])  //顺便收集唯一省份
               total[key][res[1]] = 0
            } 
            if(hasTwoPvovince && !total[key][res[2]]){ //有两组正则存在三个数据
               provinces.add(res[2])  //顺便收集唯一省份
               total[key][res[2]] = 0
            }
         }
         return res.slice(1,4) //返回正则匹配的组内容
      }
      if(res = match(/(\S{2,3})\s新增 感染患者 (\d*)人/g))  //正则
         total.ip[res[0]] += Number(res[1])
      if(res = match(/(\S{2,3})\s新增 疑似患者 (\d*)人/g))
         total.sp[res[0]] += Number(res[1])
      if(res = match(/(\S{2,3})\s疑似患者 流入 (\S{2,3})\s(\d*)人/g, true)){
         total.sp[res[0]] -= Number(res[2])
         total.sp[res[1]] += Number(res[2])
      }
      if(res = match(/(\S{2,3})\s感染患者 流入 (\S{2,3})\s(\d*)人/g, true)){
         total.ip[res[0]] -= Number(res[2])
         total.ip[res[1]] += Number(res[2])
      }
      if(res = match(/(\S{2,3})\s死亡 (\d*)人/g)){
         total.ip[res[0]] -= Number(res[1])
         total.dead[res[0]] += Number(res[1])
      }
      if(res = match(/(\S{2,3})\s治愈 (\d*)人/g)){
         total.cure[res[0]] += Number(res[1])
         total.ip[res[0]] -= Number(res[1])
      }
      if(res = match(/(\S{2,3})\s疑似患者 确诊感染 (\d*)人/g)){
         total.ip[res[0]] += Number(res[1])
         total.sp[res[0]] -= Number(res[1])
      }
      if(res = match(/(\S{2,3})\s排除 疑似患者 (\d*)人/g))
         total.sp[res[0]] -= Number(res[1])
   })
}
(function main(){
   argv.slice(1).forEach(v=>{
      var checked = false  //checked为true，说明该参数是一个以-为前缀的key
      for(item of Object.keys(cmdParam))
         if(v == '-'+item){
            reading = item
            checked = true 
            break
         }
      !checked && cmdParam[reading].push(v) //统计键值对
   })
   if(!(cmdParam.date = cmdParam.date[0])){ //没有指定日期的话
      var today = new Date()
      var [y,m,d] = [today.getFullYear(),today.getMonth()+1,today.getDate()]
   }else{
      var [y,m,d] = cmdParam.date.split('-')
   }
   for(var i=1;i<=m;i++) //不循环年份，因为19年没有这个病毒，否则你会被叫去喝茶
      for(var j=1;j<=(i!=m?MONTH[i]:d);j++){
         appendData(`2020-${i<=9?'0'+i:i}-${j<=9?'0'+j:j}`)
      }
   var provincesSorted = []
   for(let item of provinces.keys()){ //提取集合里的省份
      provincesSorted.push(item)
   }
   provincesSorted = provincesSorted.sort((a,b)=>{ //进行汉字拼音排序
      return a.localeCompare(b,'zh');
   })
   for(let item of Object.keys(total)){  //统计'全国'的数据
      let sum = 0
      for(let num of Object.values(total[item]))
         sum += num
      total[item]['全国'] = sum
   }
   provincesSorted.unshift('全国') //确保‘全国’一定在其他省份的前面
   if(!cmdParam.type.length) cmdParam.type = ['ip','sp','cure','dead'] // 不指定-type即为输出全部四项
   provincesSorted.forEach((v)=>{
      if(!(cmdParam.province.length==0 || cmdParam.province.includes(v))) return //筛选-province省份
      article +=`${v}`   //开始处理输出数据的附加项-type
      if(cmdParam.type.includes('ip')) article += ` 感染患者${total.ip[v]}人`
      if(cmdParam.type.includes('sp'))  article +=` 疑似患者${total.sp[v]}人`
      if(cmdParam.type.includes('cure'))  article +=` 治愈${total.cure[v]}人`
      if(cmdParam.type.includes('dead'))  article +=` 死亡${total.dead[v]}人`
      article +=`\n`
   })
   article +=`// 该文档并非真实数据，仅供测试使用\n// 调用的命令：${cmd}`
   fs.writeFileSync(cmdParam.out[0],article,'utf-8')  //最后写入文件
})()

//console.dir(cmdParam)
/*process.on('uncaughtException', (e)=>{
   console.error('错误：', e.message)
})
if(argv[0]!='list')
   throw new Error('命令仅可以接收list！')*/ //抛错用，似乎不需要