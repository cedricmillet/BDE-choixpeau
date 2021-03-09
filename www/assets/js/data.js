
    $( document ).ready(function() {
        
        new StudentDataLoader();
       
    });
    


    class StudentDataLoader {
        data = null; // [{nom:string,prenom:string,maison:string}]

        constructor() {
            console.log( "Loading Data..." );
            this.init();
        }

        updateWaitingCount() {
            const span = document.getElementById('eleves-count');
            const list = document.querySelectorAll(`li:not(.dispatched)`);
            span.innerHTML = `(${list.length})`;
        }

        async init() {
            /** http.get .csv */
            const rawData = await this.readFromCSV();
            /** parse csv */
            this.data = rawData.split(/\r?\n/).map(rawLine => {
                const [nom, prenom, maison] = rawLine.split(';');
                return {nom: nom, prenom: prenom, maison: maison};
            }).filter(d => d.prenom && d.maison);
            /** shuffle */
            this.data.sort( () => .5 - Math.random() );
            /** append to DOM */
            this.loadStudentList();

            this.updateWaitingCount();


            document.addEventListener('updateMageList', () => {
                this.updateWaitingCount();
            })
        }
        
        loadStudentList() {
            const ul =  document.getElementById('eleves');
            for (let i = 0; i < this.data.length; i++) {
                const student = this.data[i];
                let li = document.createElement("li");
                li.innerHTML = `${student.prenom} ${student.nom}`;
                li.classList.add('eleve');
                li.dataset.nom = student.nom;
                li.dataset.prenom = student.prenom;
                li.dataset.maison = student.maison;
                ul.appendChild(li);
            }
            console.log(`Student list loaded.`)
        }
        
        readFromCSV(file="data.csv") {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: "GET",
                    url: file,
                    dataType: "text",
                    success: (data) => resolve(data),
                    error: (request, status, error) => {
                        console.error(request.responseText);
                        reject(error);
                    }
                 });
            })
        }

    }