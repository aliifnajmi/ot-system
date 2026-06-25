let workers=[];



async function loadWorkers(){


const data =
await API.get(
"getWorkers"
);


workers=data.workers;


displayWorkers(workers);


}



function displayWorkers(list){


const container =
document.getElementById(
"workerContainer"
);



container.innerHTML="";



list.forEach(worker=>{


container.innerHTML += `


<div class="worker-card">


<div class="worker-photo">

<img src="
${worker.photo || 'assets/img/default-user.png'}
">

</div>



<h3>
${worker.full_name}
</h3>


<p>
${worker.trade}
</p>


<p>
Company :
${worker.company}
</p>


<p>
☎ ${worker.phone}
</p>



<div class="card-action">


<button onclick="
submitOT('${worker.worker_id}')
">

Submit OT

</button>



<button onclick="
editWorker('${worker.worker_id}')
">

Edit Profile

</button>


</div>



</div>



`;


});


}



function submitOT(id){

window.location.href =
"submit-ot.html?worker="+id;


}



function editWorker(id){

window.location.href =
"edit-worker.html?worker="+id;


}



document
.getElementById("searchWorker")
.addEventListener(
"keyup",
function(){


let value=this.value.toLowerCase();


let result =
workers.filter(w=>

w.full_name
.toLowerCase()
.includes(value)

);


displayWorkers(result);



});



loadWorkers();