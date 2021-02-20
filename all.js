let data = [];

const infoMenu = document.querySelector('.infoMenu');
const county = document.querySelector('.county');
const town = document.querySelector('.town');

function init(){
  const xhr = new XMLHttpRequest();
  xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
  xhr.send(null);
  xhr.onload = function(){
    data = JSON.parse(xhr.responseText).features;

    for(let i =0;data.length>i;i++){
      //  在放icon群組的圖層上 放上各個marker 
      markers.addLayer(L.marker([data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], {icon: greenIcon}).bindPopup(
        `<h1>${data[i].properties.name}</h1>
        <p>成人口罩：${data[i].properties.mask_adult}</p>
        <p>兒童口罩：${data[i].properties.mask_child}</p>`
      ));
      // add more markers here...
      // L.marker().addTo(map)
      //   )
    }
    map.addLayer(markers); //  在底層圖層放上icon群組的圖層

    renderDay();
    renderList('臺北市'); // 可以設定最初顯示縣市的資料列表
    renderCountyList();
  }
}
document.querySelector('.county').addEventListener('change',updateCity);
document.querySelector('.town').addEventListener('change',updateArea);
function updateArea(e){
  let select = e.target.value;
  let contentStr = '';
  for(let i = 0; i < data.length; i++){
    if(data[i].properties.town === select){
      contentStr += `<li>
<h6 class="name">${data[i].properties.name}</h6>
<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" alt="marker" class="marker_icon" data-locate="${[data[i].geometry.coordinates[0], data[i].geometry.coordinates[1]]}" data-name="${data[i].properties.name}" data-mask_adult="${data[i].properties.mask_adult}" data-mask_child="${data[i].properties.mask_child}">
<p class="address">${data[i].properties.address}</p>
<p class="phone">${data[i].properties.phone}</p>
<p class="openTime">${data[i].properties.note}</p>
<div class="adultMask">成人口罩<span class="adultMaskNumber">${data[i].properties.mask_adult}</span></div>
<div class="kidMask">兒童口罩<span class="kidMaskNumber">${data[i].properties.mask_child}</span></div>
   </li> `
    }
  }
  infoMenu.innerHTML = contentStr;
}
function updateCity(e){
  let countyValue = e.target.value;
  let allTown = [];
  let newTownList = '';
  let townStr = '';
  townStr = `<option value="" disabled selected hidden> -請選擇行政區- </>`;
  for (let i = 0; i < data.length; i++) {
    const countyMatch = data[i].properties.county; 
    if (countyValue == countyMatch) { 
      // 比對相同的縣市名稱才會只撈出那個縣市的行政區，不然會全部都出現
      allTown.push(data[i].properties.town);
    }
  }
  newTownList = Array.from(new Set(allTown))
  newTownList.forEach(function (value) { 
    // 由於使用 set() 方法，建議採用 forEach 取出行政區名稱
    townStr += `<option value="${value}">${value}</option>`
  })
  // 重新渲染列表
  let select = e.target.value;
  let contentStr= '';
  for(let i = 0; i < data.length; i++){
    if(select == data[i].properties.county){
      contentStr += `<li>
<h6 class="name">${data[i].properties.name}</h6>
<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" alt="marker" class="marker_icon" data-locate="${[data[i].geometry.coordinates[0], data[i].geometry.coordinates[1]]}" data-name="${data[i].properties.name}" data-mask_adult="${data[i].properties.mask_adult}" data-mask_child="${data[i].properties.mask_child}">
<p class="address">${data[i].properties.address}</p>
<p class="phone">${data[i].properties.phone}</p>
<p class="openTime">${data[i].properties.note}</p>
<div class="adultMask">成人口罩<span class="adultMaskNumber">${data[i].properties.mask_adult}</span></div>
<div class="kidMask">兒童口罩<span class="kidMaskNumber">${data[i].properties.mask_child}</span></div>
   </li> `
    }
  }
  infoMenu.innerHTML = contentStr;
  town.innerHTML = townStr;
}

init()

// 設定地圖及定位
let map = L.map('map',{
  center: [25.0475613, 121.5173399],
  zoom: 10});

// 載入底層圖資OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 新增green icon
var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 新增一個圖層，專門放icon群組
var markers = new L.MarkerClusterGroup().addTo(map);

// 點擊icon後跳至藥局位置
$(infoMenu).delegate('.marker_icon', 'click', function (e) {
  let tempdata = e.target.dataset.locate;
  let tempName = e.target.dataset.name;
  let mask_adult = e.target.dataset.mask_adult;
  let mask_child = e.target.dataset.mask_child;
  console.log(e.target.dataset);
  let str = tempdata.split(",");
  let numA = parseFloat(str[0]);
  let numB = parseFloat(str[1]);
  let location = [numB, numA];
  console.log(`[藥局座標]`, location);
  map.setView(location, 20);
  L.marker(location)
    .addTo(map)
    .bindPopup(`<h1>${tempName}</h1>
        <p>成人口罩：${mask_adult}</p>
        <p>兒童口罩：${mask_child}</p>`)
    .openPopup();
});

// 更新選單
// 先撈出全部縣市
// 再過濾重複的資料
// 放到選單裡呈現
// 點選對應的選單資料則下方的列表就呈現對應縣市的資料
function renderCountyList(){
  // 先撈出全部的縣市
  const dataLen = data.length;
  let dataAllCounty = [];
  for(let i = 0 ; i < dataLen ; i++){
    if (data[i].properties.county !== ""){
      dataAllCounty.push(data[i].properties.county);
    }
  }

  // 從 dataAllCounty 抓取不重複的 縣市 丟到 noRepeatCounty
  noRepeatCounty = Array.from(new Set(dataAllCounty));
  // console.log(noRepeatCounty);

  // 將 noRepeatCounty 資料丟回 HTML 的 select
  let strCounty = '';
  strCounty = `<option value="" disabled selected hidden>--請選擇縣市--</option>`;
  for(let i = 0 ; i < noRepeatCounty.length ; i++){
    strCounty += `<option value="${noRepeatCounty[i]}">${noRepeatCounty[i]}</option>`;
    county.innerHTML = strCounty;
    town.innerHTML = `<option value="" disabled selected hidden> -請選擇行政區- </option>`;
  }
}
// 最一開始在ul的 infoMenu 內塞資料
function renderList(city){
  let str = '';
  const dataLen = data.length;
  for (let i = 0; i< dataLen; i++){
    const countyName = data[i].properties.county;
    // const listInfo = document.createElement(`li`);
    // listInfo.innerHTML =
    if(countyName == city){
      str +=`<li>
<h6 class="name">${data[i].properties.name}</h6>
<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" alt="marker" class="marker_icon" data-locate="${[data[i].geometry.coordinates[0], data[i].geometry.coordinates[1]]}" data-name="${data[i].properties.name}" data-mask_adult="${data[i].properties.mask_adult}" data-mask_child="${data[i].properties.mask_child}">
<p class="address">${data[i].properties.address}</p>
<p class="phone">${data[i].properties.phone}</p>
<p class="openTime">${data[i].properties.note}</p>
<div class="adultMask">成人口罩<span class="adultMaskNumber">${data[i].properties.mask_adult}</span></div>
<div class="kidMask">兒童口罩<span class="kidMaskNumber">${data[i].properties.mask_child}</span></div>
    </li>`
    }
    // infoMenu.appendChild(listInfo);
  }
  infoMenu.innerHTML = str;
}
// 顯示日期星期及領取資料
function renderDay(){
  let _chineseDay = judgeDay();
  document.querySelector('.todayCn').textContent = _chineseDay;

  let _today = getToday();
  document.querySelector('.todayNum').textContent = _today;

  // 取得今天星期幾
  function judgeDay(){
    let date = new Date();
    let day = date.getDay();
    switch (day) {
      case 0:
        return `星期日`;
      case 1:
        return `星期一`;
      case 2:
        return `星期二`;
      case 3:
        return `星期三`;
      case 4:
        return `星期四`;
      case 5:
        return `星期五`;
      case 6:
        return `星期六`;
      default:
        return `星期日`;
    }
  }
  // 取得今天西元日期
  function getToday(){
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let todayDate = `${year}-${month+1}-${day}`;
    return todayDate;
  }
  // 判斷身分證數字領取資格
  if (
    document.querySelector('.todayCn').textContent === `星期一` || document.querySelector('.todayCn').textContent === `星期三` || document.querySelector('.todayCn').textContent === `星期五`)
  {document.querySelector('.buyId').textContent = `1,3,5,7,9`;
  } 
  else if (
    document.querySelector('.todayCn').textContent === `星期二` || document.querySelector('.todayCn').textContent === `星期四` || document.querySelector('.todayCn').textContent === `星期六`)
  { document.querySelector('.buyId').textContent = `2,4,6,8,0`;
  } 
  else 
  { document.querySelector('.buyId').textContent = `任何數字`;};
}