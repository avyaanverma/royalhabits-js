const $ = (cls)=>{
    return document.querySelector(cls)
}
const $$ = (cls)=>{
    return document.querySelectorAll(cls)
}

// github grid
const githubGrid = $(".github-grid");
var sum = ''
for(let i=0; i<365; i++){
    sum += "<div></div>";
}

githubGrid.innerHTML = sum;





// pomodoro session
const dateEl = document.getElementById("todayDate")

const today = new Date()

dateEl.innerText = today.toDateString()

const tooltip = document.getElementById("tooltip");

// parse(), stringify()

// 365
let habitData = [];

function generateData(){
    const startDate = new Date(2026, 0, 1); 
    for(let i = 0; i < 365; i++){
        const date = new Date(startDate);
        date.setDate(startDate.getDate()+i);        
        habitData.push({date: date.toISOString().split("T")[0], status: false})
    } 

}

habitData = JSON.parse(localStorage.getItem("habits"));

if(!habitData){
    habitData = []
    generateData();
    localStorage.setItem("habits", JSON.stringify(habitData));
}

let trackBox = $$(".github-grid div");


habitData.forEach((obj,index)=>{
    if(obj.status){
        trackBox[index].classList.add("active");
    }
})

trackBox.forEach((box, index)=>{
    const date = new Date(habitData[index].date);
    box.setAttribute("title", date.toDateString());

    box.addEventListener("click", ()=>{
        const todayIndex = getTodayIndex();

        if(index > todayIndex){
            return;   // stop clicking future dates
        }
        box.classList.toggle("active");
        habitData[index].status = box.classList.contains("active");

        localStorage.setItem("habits", JSON.stringify(habitData));

        updateAnalytics();
    })
    box.addEventListener("mouseenter",(e)=>{
        tooltip.textContent = habitData[index].date;
        tooltip.style.opacity = 1;
    });

    box.addEventListener("mousemove",(e)=>{
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.pageY - 20 + "px";
    });

    box.addEventListener("mouseleave",()=>{
        tooltip.style.opacity = 0;
    });
})

updateAnalytics();

function getTodayIndex(){

    const today = new Date().toISOString().split("T")[0];

    return habitData.findIndex(day => day.date === today);

}

function getCurrentStreak(){

    const todayIndex = getTodayIndex();

    let streak = 0;

    for(let i = todayIndex-1; i >= 0; i--){

        if(habitData[i].status){
            streak++;
        }else{
            break;
        }

    }

    return streak;

}

function renderChart(){

    const ctx = document.getElementById("habitChart");

    const last7 = habitData.slice(getTodayIndex()-6, getTodayIndex()+1);

    const labels = last7.map(day => {
        const d = new Date(day.date);
        return d.toLocaleDateString('en-US',{weekday:'short'});
    });

    const data = last7.map(day => day.status ? 1 : 0);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Habit",
                data: data,
                backgroundColor: "#27187d",
                borderRadius: 4
            }]
        },
        options:{
            plugins:{
                legend:{display:false}
            },
            scales:{
                y:{
                    display:false,
                    beginAtZero:true,
                    max:1
                },
                x:{
                    ticks:{color:"#27187d"}
                }
            }
        }
    });

}

function updateAnalytics(){

    const streak = getCurrentStreak();

    document.querySelector(".analytics").innerHTML = `
        <img src="./fire.png"/>
        <p>${streak}</p>
        <canvas id="habitChart"></canvas>
    `;

    renderChart();  
}

const todayIndex = getTodayIndex();

trackBox.forEach((box,index)=>{

    if(index > todayIndex){
        box.classList.add("future-day");
    }

});
trackBox[todayIndex].style.border = "2px solid white";



console.log(habitData);


// Pomodoro Timer
const pomodoroDisplay = document.getElementById("pomodoroTime");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let pomodoroTime = 25 * 60;
let timerInterval = null;

function updateTimerDisplay(){

    const minutes = Math.floor(pomodoroTime / 60);
    const seconds = pomodoroTime % 60;

    pomodoroDisplay.textContent =
        `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function startTimer(){

    if(timerInterval) return;

    timerInterval = setInterval(()=>{

        if(pomodoroTime <= 0){
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Pomodoro finished!");
            return;
        }

        pomodoroTime--;
        updateTimerDisplay();

    },1000);

}

function pauseTimer(){
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer(){
    pauseTimer();
    pomodoroTime = 25 * 60;
    updateTimerDisplay();
}

playBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimerDisplay();