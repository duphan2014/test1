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