document.addEventListener('DOMContentLoaded',()=>{
    const app=new Vue({
        el:"#app",
        data: {
            events: [],
            isLoaded:false,
        },
        methods:{
            createEvent:async function ($e){
                let ret=await axios.post("/api/v1/event");
                this.events.unshift(ret.data)
                console.log("createEvent", $e)
            }
        },
        watch:[],
        mounted:async function(){
            console.log("vue ready")
            let ret=await axios.get("/api/v1/event");
            this.events=ret.data;
            this.isLoaded=true;
        }
    })

});
