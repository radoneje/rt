document.addEventListener('DOMContentLoaded',()=>{
    const app=new Vue({
        el:"#app",
        data: {
            isLoaded:false,
            spkid:(spk? spk.id : null),
            spkName:(spk? spk.name:"")
        },
        methods:{
            emoItemClick:async function(item, $event){
                var elem=document.querySelector(".emoItem"+item);
                if(elem.classList.contains("clicked"))
                    return;
                elem.classList.add("clicked")
                setTimeout(()=>{
                    elem.classList.remove("clicked")
                },1000)
                await axios.post("/api/v1/emo",{spk, emoid:item})

            },
            logOut:async function ($e){
                await axios.get("/api/v1/spkLogOut" )
                spk=null;
                this.spkid=null;
                this.spkName="";
                await this.$nextTick();
                let elem=document.getElementById("spkName");
                if(elem) {
                    elem.focus();
                    elem.classList.remove("error")
                }
            },
            onSubmit:async function ($e){
                $e.preventDefault()
                if(this.spkName.length<2){
                    let elem=document.getElementById("spkName");
                    elem.classList.add("error")
                    elem.focus();
                    return ;
                }
                try {
                    let r = (await axios.post("/api/v1/spkLogin", {name: this.spkName, eventid})).data;
                    spk=r;
                    this.spkid=(spk? r.id : null);
                    this.spkName=(spk? r.name:"");
                    console.log("this.spkid",this.spkid)
                }
                catch (e){
                    console.warn(e)
                }

                return false;
            },
            login:async function($e){

            }
        },
        watch:[],
        mounted:async function(){
            this.isLoaded=true;
            await this.$nextTick();
            let elem=document.getElementById("spkName");
            if(elem)
                elem.focus();
        }
    })

});
