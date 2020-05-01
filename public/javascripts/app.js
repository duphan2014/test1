function runTest(){
	// << reset display of previous run
	var steps = document.getElementsByClassName('step');
	for (var i = 0; i < steps.length; i++) {
	  steps[i].style.color = 'black';
	}

	var progressBar = document.getElementById("myBar");
    progressBar.style.width = 0 + "%";
    // >>

    document.getElementById("runningIcon").style.visibility="visible";

	$.ajax({
	  "url": "/runTest",
	  "method": "POST"
	});
	// $.get("/printString", function(string){
 //        document.getElementById('currentStep').textContent = string;
 //    });
}

function toggleValidationDataVisibility(element){
	var x = $(element).parent().find('.validation-data')[0];
    if (x.style.display === "none") {
    	x.style.display = "block";
    } else {
    	x.style.display = "none";
  	}
  	var y = $(element).find('.visibility-icon')[0];
	if ($(y).text() == "-") {
    	$(y).text("+");
    } else {
    	$(y).text("-");
  	}
}