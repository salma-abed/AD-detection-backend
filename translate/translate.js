const fs = require('fs')
var getDeepValue = function(obj, path,dynamicValues={}){
  let translateObject = {...obj};
  for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
    if(obj != undefined){
      obj = obj[path[i]];
    }
  };
  if( typeof obj == 'string' && Object.keys(dynamicValues)){
    Object.keys(dynamicValues)?.forEach(key =>{
      let dynamicKey = new RegExp('{{'+key+'}}', 'ig')
      obj = obj?.replace(dynamicKey,dynamicValues[key])
    })
  }
  let returnedValue = obj;
  // if(returnedValue == "translate-not-found"){
  //   translateObject
  //   fs.writeFileSync(`./${lang}.json`,JSON.stringify(translateObject))
  // }
  return returnedValue;
};
function translate(path,lang="en",dynamicValues={}){
  const translateObject = require(`./${lang}.json`);
  return getDeepValue(translateObject,path,dynamicValues)
}

module.exports = translate