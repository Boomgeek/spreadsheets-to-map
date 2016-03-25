var map;
var spreadSheetObj;

$(function(){

	init();
	callSpreadSheet("1rVIcAH6_FaAHXr0JSxsXuEJLCBsTt7PTWqPmjlueOws", function(){
		jsonToMarker();
	});

	function init() {
		map = new longdo.Map({
			placeholder: document.getElementById('map')
		});
	}

	function callSpreadSheet(sheetId,callback){
		$.ajax({
			url: "https://script.google.com/macros/s/AKfycbxOLElujQcy1-ZUer1KgEvK16gkTLUqYftApjNCM_IRTL3HSuDk/exec",
			type: "GET",
			datatype: "jsonp",
			data: "id="+sheetId+"&sheet=Sheet1",
			success: function(res){
				console.log(res);
				spreadSheetObj = res;
				callback();
			} 
		});
	}

	function jsonToMarker(){
		for(i=0; i<spreadSheetObj['Sheet1'].length; i++){
			icon = spreadSheetObj['Sheet1'][i]['Icon'];
			title = spreadSheetObj['Sheet1'][i]['Title'];
			description = spreadSheetObj['Sheet1'][i]['Description'];
			zoom = spreadSheetObj['Sheet1'][i]['Zoom'];
			lat = spreadSheetObj['Sheet1'][i]['Latitude'];
			lon = spreadSheetObj['Sheet1'][i]['Longitude'];
			addMarker(icon, title, description, zoom, lat, lon);
		}
	}

	function addMarker(icon, title, description, zoom, lat, lon){
		var marker = new longdo.Marker({ lon: lon, lat: lat },
		{
		  title: title,
		  icon: {
		    url: icon,
		    offset: { x: 12, y: 45 }
		  },
		  detail: "<b>description:</b>"+description+"<br><b>lat:</b>"+lat+"<br><b>lon:</b>"+lon,
		  visibleRange: { min: zoom-5, max: zoom },
		  draggable: false
		});
		map.Overlays.add(marker);
	}

});



