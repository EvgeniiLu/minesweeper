document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    function addEventListenerFunc() {
        document.addEventListener('click', eventListinerLeftClick);
        document.addEventListener('contextmenu', eventListinerRightClick);
    }

    function removerEventListenerFunc() {
        document.removeEventListener('click', eventListinerLeftClick);
        document.removeEventListener('contextmenu', eventListinerRightClick);
    }
    
    function eventListinerLeftClick(event) { 
        if(event.target.classList.contains('cell')) {
            sapper.choiceOfOperation(event.target);
        }
    }

    function eventListinerRightClick(event) {
        event.preventDefault();
        sapper.flagCounterManager(event);
        sapper.choiceOfOperation();
    }
    
    setTimeout(function startTheGame(){
        sapper.select.addEventListener('change', createGame);
        sapper.restart.addEventListener('click', createGame);
        sapper.createTable();
        addEventListenerFunc();
    }, 0); 

    function createGame() {
        if(sapper.select.value == 'easy'){
            sapper = new Sapper(9, 9, 10);
        }
        else if(sapper.select.value == 'medium') {
            sapper = new Sapper(16, 16, 40);
        } 
        else {
            sapper = new Sapper(16, 30, 99);
        }
        sapper.flagCounter.textContent = `${sapper.mines}`;
        sapper.wraper.removeAttribute('style');
        sapper.rerenderTable();
        addEventListenerFunc();
    }
    
    class Sapper {

        get select() {
            return document.querySelector('.select');
        }
        get restart() {
            return document.querySelector('.restart');
        }
        get wraper() {
            return document.querySelector('.wraper');
        }
        get flagCounter() {
            return document.querySelector('.flagcounter');
        }
        get gameTable() {
            return document.querySelector('.game_table');
        }
        get cellsArr() {
            return document.querySelectorAll('.cell');
        }

        constructor(height, width, mines) {
            this.height = height;
            this.width = width;
            this.mines = mines;
            this.firstClick = false;
            this.gameOver = false;
        }
        
        rerenderTable() {
            this.removeOldTable();
            this.createNewTable();
            this.createGrid();
        }

        createTable() {
            this.createNewTable();
            this.createGrid();
        }

        removeOldTable() {
            let table = document.querySelector('.game_table');
            if (table) {
                table.remove();
            }
        }

        createNewTable() {
            let div = document.createElement('div');
            div.classList.add('game_table');
            div.setAttribute('counteropencells', '0');
            div.setAttribute('counterflags', '0');
            this.wraper.append(div);
        }

        createGrid() {
            let divLine = [];
            let cells = [];
            let table = document.querySelector('.game_table');
            for(let i = 0; i < this.height; i ++) {
                divLine[i] = document.createElement('div');
                table.append(divLine[i]);
                divLine[i].id = `line${i}`;
                divLine[i].classList.add('line');
               
                for(let j = 0; j < this.width; j++) {
                    cells[j] = document.createElement('div');
                    document.querySelector(`#line${i}`).append(cells[j]);
                    cells[j].id = `${i}-${j}`;
                    cells[j].classList.add('cell');
               }
            }
            this.wraper.style.width =`${table.clientWidth}px`;
        }

        flagCounterManager(event) {
            let counter = +this.flagCounter.textContent;
            if(event.target.classList.contains('cell') && !event.target.classList.contains('flag') && !event.target.hasAttribute('checked')) {
                event.target.classList.add('flag');
                counter--;
                if(event.target.classList.contains('flag') && event.target.hasAttribute('mine')) {
                    this.counterFunc('counterflags');
                }
            } else if (!event.target.hasAttribute('checked') && event.target.classList.contains('cell')) {
                event.target.classList.remove('flag');
                counter++;
                if(!event.target.classList.contains('flag') && event.target.hasAttribute('mine')) {
                    this.counterFunc('counterflags', false);
                }
            }
            this.flagCounter.textContent = counter;
        } 

        counterFunc(value, plus = true) {
            let num = +this.gameTable.getAttribute(`${value}`);
            plus ? num++ : num--;
            this.gameTable.setAttribute(`${value}`, `${num}`);
        }

        choiceOfOperation(event = false) {
            if(event) {
                if(!this.firstClick) {
                    this.firstClickAndCreateMines(event);
                    this.firstClick = true;
                } else {
                    if(event.hasAttribute('mine') && !event.classList.contains('flag')) {
                        event.style.border = '4px outset red';
                        this.gameOver = true;
                    } 
                    else if(event.getAttribute('number') != '0') {
                        this.defineСlass(event);
                    }
                    else { 
                        this.defineСlass(event);
                        this.openCells(event);
                    }
                }
            }
            this.checkingСonditionsGame();
        }

        checkingСonditionsGame() {
            if(this.flagCounter.textContent === '0' && this.gameTable.getAttribute('counterflags') === `${this.mines}`) {
                this.cellsArr.forEach(value => {
                    if(!value.hasAttribute('checked'))
                        this.defineСlass(value);
                });
                removerEventListenerFunc();
            }
            else if (`${this.height * this.width - this.mines}` === this.gameTable.getAttribute('counteropencells')) {
                removerEventListenerFunc();
            }
            else if(this.gameOver) {
                removerEventListenerFunc();
                this.cellsArr.forEach(value => {
                    if(value.hasAttribute('mine') && !value.classList.contains('flag')) {
                        value.classList.add('mine');
                    }
                    if(!value.hasAttribute('mine') && value.classList.contains('flag')) {
                        value.classList.replace('flag', 'err');
                    }
                });
            }
        }

        firstClickAndCreateMines(event) {
            let set = new Set();
            let arr = this.elemEnvironmentFunc(event);

            setAttributeZero(arr);
            difficultyСoefficient(arr);
            event.setAttribute('number', '0');
            set.add(event);
            forMines.call(this, set);
            this.countAndSetAttribute(event);

            function setAttributeZero(arr) {
                arr.forEach(value => {
                    value.setAttribute('number', '0');
                    set.add(value);
                });
            }

            function forMines(set) {
                while(set.size < (this.mines + arr.length + 1)) {
                    let randome = Math.floor(Math.random() * (sapper.height * sapper.width));
                    set.add(this.cellsArr[randome]);
                }
                set.forEach(value => {
                    if(!value.getAttribute('number')) {
                        value.setAttribute('mine', '');
                    }
                });
            }

            function difficultyСoefficient(arr) {
                if(sapper.select.value == 'medium') {
                    coeff(0.3);
                }
                if(sapper.select.value == 'hard')  {
                    coeff(0.6);
                }
                function coeff(num) {
                    arr.forEach(elem => {
                        let random = Math.random();
                        if (random < num) {
                            let arr2 = sapper.elemEnvironmentFunc(elem);
                            setAttributeZero(arr2);
                        }
                    });
                }
            }
        }

        countAndSetAttribute(event) {
            for(let i = 0; i < this.cellsArr.length; i++) {
                resetFlags(this.cellsArr[i]);
                let counter = 0;
                let cell = this.elemEnvironmentFunc(this.cellsArr[i]);
                if(this.cellsArr[i].hasAttribute('mine')) {
                    continue;
                }
                cell.forEach(value => {
                    if(value.hasAttribute('mine')) {
                        counter++;
                    }
                });
                this.cellsArr[i].setAttribute('number', counter);
            }
            this.openCells(event);

            function resetFlags(elem) {
                if(elem.classList.contains('flag')) {
                    elem.classList.remove('flag');
                    sapper.flagCounter.textContent = sapper.mines;
                }
            }
        }

        openCells(event) {
            this.defineСlass(event);
            let arr = this.elemEnvironmentFunc(event)
            .filter(value => !value.hasAttribute('checked') && !value.hasAttribute('mine'));
            for(let i = 0; i < arr.length; i++) {
                if(!arr[i].hasAttribute('checked') && !arr[i].classList.contains('flag')) {
                    this.defineСlass(arr[i]);
                    if(arr[i].getAttribute('number') == '0') {
                        this.openCells(arr[i]);
                    }
                }
            }
        }

        elemEnvironmentFunc(elem) {
            let elemEnvironment  = [];
            let elemY = +elem.id.split('-')[0];
            let elemX = +elem.id.split('-')[1];
    
            //upper left corner 
            if(elemY == 0 && elemX == 0) {
                elemEnvironment.push(`${elemY}-${elemX + 1}`, 
                                    `${elemY + 1}-${elemX + 1}`,
                                    `${elemY + 1}-${elemX}`);
    
            //top right corner
            } else if(elemY == 0 && elemX == this.width - 1) {
                elemEnvironment.push(`${elemY + 1}-${elemX}`,
                                    `${elemY + 1}-${elemX - 1}`, 
                                    `${elemY}-${elemX - 1}`);
    
            //lower left corner
            } else if(elemY == this.height - 1 && elemX == 0) {
                elemEnvironment.push(`${elemY}-${elemX + 1}`,
                                    `${elemY - 1}-${elemX}`, 
                                    `${elemY - 1}-${elemX + 1}`);
    
            //bottom right corner
            } else if(elemY == this.height - 1 && elemX == this.width - 1) {
                elemEnvironment.push(`${elemY}-${elemX - 1}`, 
                                    `${elemY - 1}-${elemX - 1}`,
                                    `${elemY - 1}-${elemX}`);
    
            //up 
            } else if(elemY == 0 && elemX > 0 && elemX < this.width - 1) {
                elemEnvironment.push(`${elemY}-${elemX + 1}`, 
                                    `${elemY + 1}-${elemX + 1}`,
                                    `${elemY + 1}-${elemX}`, 
                                    `${+elemY + 1}-${elemX - 1}`, 
                                    `${elemY}-${elemX - 1}`);
    
            //bottom
            } else if(elemY == this.height - 1 && elemX > 0 && elemX < this.width - 1) {
                elemEnvironment.push(`${elemY}-${elemX + 1}`,
                                    `${elemY}-${elemX - 1}`,
                                    `${elemY - 1}-${elemX - 1}`,
                                    `${elemY - 1}-${elemX}`, 
                                    `${elemY - 1}-${elemX + 1}`);
    
            //left
            } else if (elemY > 0 && elemY < this.height - 1 && elemX == 0) {
                elemEnvironment.push(`${elemY}-${elemX + 1}`, 
                                    `${elemY + 1}-${elemX + 1}`,
                                    `${elemY + 1}-${elemX}`, 
                                    `${elemY - 1}-${elemX}`, 
                                    `${elemY - 1}-${elemX + 1}`);
    
            //right
            } else if (elemY > 0 && elemY < this.height - 1 && elemX == this.width - 1) {
                elemEnvironment.push(`${elemY + 1}-${elemX}`, 
                                    `${elemY + 1}-${elemX - 1}`, 
                                    `${elemY}-${elemX - 1}`, 
                                    `${elemY - 1}-${elemX - 1}`,
                                    `${elemY - 1}-${elemX}`);
            
            //centre
            } else {
                elemEnvironment.push(`${elemY}-${elemX + 1}`, `${elemY + 1}-${elemX + 1}`,
                                    `${elemY + 1}-${elemX}`, `${elemY + 1}-${elemX - 1}`, 
                                    `${elemY}-${elemX - 1}`, `${elemY - 1}-${elemX - 1}`,
                                    `${elemY - 1}-${elemX}`, `${elemY - 1}-${elemX + 1}`);
            }
            return elemEnvironment.map(value => document.getElementById(value));
        }

        defineСlass(value) {
            switch (value.getAttribute('number')) {
                case '0': value.classList.add('num0');
                break;
                case '1': value.classList.add('num1');
                break;
                case '2': value.classList.add('num2');
                break;
                case '3': value.classList.add('num3');
                break;
                case '4': value.classList.add('num4');
                break;
                case '5': value.classList.add('num5');
                break;
                case '6': value.classList.add('num6');
                break;
                case '7': value.classList.add('num7');
                break; 
                case '8': value.classList.add('num8');
                break;
            }
            if (!value.hasAttribute('checked') && !value.classList.contains('flag')) this.counterFunc('counteropencells');

            if (!value.classList.contains('flag')) value.setAttribute('checked', '');
        }
    }
    let sapper = new Sapper(9, 9, 10);      
});