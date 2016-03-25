var map;
var spreadSheetObj;

$(function(){

	init();
	callSpreadSheet("1rVIcAH6_FaAHXr0JSxsXuEJLCBsTt7PTWqPmjlueOws");

	function init() {
		map = new longdo.Map({
			placeholder: document.getElementById('map')
		});
	}

	function callSpreadSheet(sheetId){
		$.ajax({
			url: "https://script.google.com/macros/s/AKfycbxOLElujQcy1-ZUer1KgEvK16gkTLUqYftApjNCM_IRTL3HSuDk/exec",
			type: "GET",
			datatype: "jsonp",
			data: "id="+sheetId+"&sheet=Sheet1",
			success: function(res){
				console.log(res);
				spreadSheetObj = res;
			} 
		});
	}

});



