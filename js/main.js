/* ============================================================
   Script del catalogo. 
   main.js è il motore del catalogo: permette di filtrare, cercare e ordinare le schede degli item. 
   - filtro per tipologia documentaria (accesso tematico/tipologico)
   - ricerca libera "google-like" (W3Schools HowTo: Filter List)
   - ordinamento alfabetico e cronologico (accesso alfabetico/temporale)
   ============================================================ */

(function () {
  "use strict"; // attiva la modalità rigida di JavaScript, trasformando quelli che normalmente sarebbero errori silenziosi in veri e propri errori di blocco

  var griglia = document.getElementById("griglia-item"); //Cerca un elemento HTML con id="griglia-item" nella pagina e lo assegna alla variabile griglia.
  if (!griglia) return; // lo script gira solo nella pagina catalogo, se l'elemento non esiste, lo script si ferma

  var campoRicerca = document.getElementById("ricerca-libera"); //la casella di ricerca testuale
  var contatore = document.getElementById("contatore-item"); //l'elemento che mostra quante schede sono visibili
  var bottoniFiltro = document.querySelectorAll("[data-filtro]"); //seleziona tutti i pulsanti che hanno l'attributo data-filtro. Li salva in una lista per poterli usare dopo.
  var bottoniOrdine = document.querySelectorAll("[data-ordine]"); //seleziona tutti i pulsanti che hanno l'attributo data-ordine (i pulsanti di ordinamento)
  
  // Crea una variabile che ricorda quale filtro è attualmente selezionato. 
  // All'inizio è impostata su "all" (mostra tutti gli item), ma cambierà quando l'utente clicca un pulsante filtro diverso.
  var tipoAttivo = "all"; 

  //Restituisce tutte le schede (elementi con classe item-card) contenute nella griglia. 
  //Array.prototype.slice.call(...) serve a convertire la NodeList in un vero array JavaScript, così possiamo usarci sopra metodi come .sort() e .forEach().
  function schede() {
    return Array.prototype.slice.call(griglia.querySelectorAll(".item-card"));
  }

  /* Legge il testo della ricerca.
  .trim() toglie gli spazi all'inizio e alla fine.
  .toLowerCase() lo trasforma in minuscolo, così la ricerca non distingue maiuscole/minuscole */
  function aggiorna() {
    var query = (campoRicerca ? campoRicerca.value : "").trim().toLowerCase(); //query per cercare il testo nelle schede
    var visibili = 0; //Serve per contare quante schede rimangono visibili dopo l'applicazione dei filtri
    
    /* Per ogni scheda:
    legge il tipo dall'attributo data-tipo.
    legge tutto il testo contenuto nella scheda (textContent).
    okTipo è vero se il filtro è su "all" o se il tipo della scheda coincide con quello attivo.
    okTesto è vero se la casella è vuota o se il testo della scheda contiene la query. */
    schede().forEach(function (card) {
      var tipo = card.getAttribute("data-tipo");  // Recupera la tipologia dell'item dall'attributo HTML data-tipo della scheda
      var testo = card.textContent.toLowerCase(); // Estrae tutto il testo scritto dentro la scheda e lo trasforma in minuscolo
      var okTipo = tipoAttivo === "all" || tipo === tipoAttivo; // Verifica se la scheda corrisponde al filtro di tipo selezionato (o se il filtro è impostato su "mostra tutti")
      var okTesto = query === "" || testo.indexOf(query) !== -1; // Verifica se la parola cercata è vuota o se è presente dentro il testo della scheda

      //Se entrambe le condizioni sono vere, la scheda viene mostrata (rimuovendo la classe che la nasconde); altrimenti viene nascosta.
      if (okTipo && okTesto) {
        card.classList.remove("hidden-item"); // Rimuove la classe CSS che nasconde l'elemento per renderlo visibile
        visibili++; // Incrementa di 1 il numero delle schede attualmente visualizzate a schermo
      } else {
        card.classList.add("hidden-item"); // Aggiunge la classe CSS che nasconde l'elemento dalla pagina
      }
    });

    //Aggiorna il contatore con il numero di schede visibili, gestendo il singolare/plurale.
    if (contatore) {
      contatore.textContent =
        visibili + (visibili === 1 ? " item visualizzato" : " item visualizzati");
    }
  }

  /* Filtro per tipologia
     Quando clicchi un pulsante filtro:
      toglie la classe active da tutti i pulsanti.
      la mette solo sul pulsante cliccato.
      memorizza il tipo scelto in tipoAttivo.
      chiama aggiorna() per applicare il filtro. */
  bottoniFiltro.forEach(function (btn) {
    btn.addEventListener("click", function () { // Resta in ascolto del click su ciascun bottone di filtro
      bottoniFiltro.forEach(function (b) { // Cicla nuovamente tutti i bottoni di filtro per resettarli
        b.classList.remove("active"); // Rimuove lo stato visivo di selezione attivo da tutti i bottoni di filtro
      });
      btn.classList.add("active"); // Aggiunge lo stato visivo di selezione attivo solo al bottone appena cliccato
      tipoAttivo = btn.getAttribute("data-filtro"); // Salva il valore del filtro (es. "libri", "foto") associato al bottone cliccato
      aggiorna(); // Riesegue la funzione per mostrare solo le schede che corrispondono al nuovo filtro
    });
  });

  /* Ricerca libera
  input scatta ogni volta che scrivi nella casella.
  Se la ricerca è dentro un <form>, submit viene intercettato con 
  e.preventDefault() per evitare che la pagina si ricarichi. */
  if (campoRicerca) {
    campoRicerca.addEventListener("input", aggiorna); // Avvia la funzione aggiorna() in tempo reale ogni volta che l'utente digita o cancella un carattere
    var form = campoRicerca.closest("form"); // Cerca il tag <form> più vicino che contiene la casella di ricerca
    if (form) {
      form.addEventListener("submit", function (e) { // Resta in ascolto dell'invio del form (es. pressione del tasto Invio)
        e.preventDefault(); // Blocca l'invio standard del form per evitare il ricaricamento dell'intera pagina del browser
        aggiorna(); // Applica manualmente la ricerca e l'aggiornamento delle schede
      });
    }
  }

  /* Ordinamento: alfabetico (data-titolo) o cronologico (data-anno) 
    legge il criterio scelto (titolo, anno o anno-desc).
    ordina le schede:
    per titolo: usa localeCompare("it") per un ordinamento alfabetico corretto in italiano.
    per anno: converte gli attributi data-anno in numeri e li confronta.
    anno-desc inverte il confronto (dal più recente al più antico).
    appendChild le riaggiunge alla griglia nel nuovo ordine. */
  bottoniOrdine.forEach(function (btn) {
    btn.addEventListener("click", function () { // Resta in ascolto del click su ciascun bottone di ordinamento
      bottoniOrdine.forEach(function (b) { // Cicla tutti i bottoni di ordinamento per resettarli
        b.classList.remove("active"); // Rimuove lo stato visivo di selezione attivo da tutti i bottoni di ordinamento
      });
      btn.classList.add("active"); // Aggiunge lo stato visivo di selezione attivo solo al bottone di ordinamento cliccato

      var criterio = btn.getAttribute("data-ordine"); // Recupera il tipo di ordinamento da applicare ("titolo", "anno" o "anno-desc")
      var ordinate = schede().sort(function (a, b) { // Prende l'elenco delle schede e avvia la funzione di ordinamento integrata di JavaScript
        if (criterio === "titolo") {
          return a
            .getAttribute("data-titolo") // Recupera il titolo della scheda A
            .localeCompare(b.getAttribute("data-titolo"), "it"); // Lo confronta alfabeticamente con la scheda B rispettando le regole della lingua italiana
        }
        var annoA = parseInt(a.getAttribute("data-anno"), 10); // Recupera l'anno della scheda A e lo trasforma da testo a numero intero decimale
        var annoB = parseInt(b.getAttribute("data-anno"), 10); // Recupera l'anno della scheda B e lo trasforma da testo a numero intero decimale
        return criterio === "anno-desc" ? annoB - annoA : annoA - annoB; // Se il criterio è decrescente fa B meno A (più recente prima), altrimenti fa A meno B (più vecchio prima)
      });

      ordinate.forEach(function (card) { // Cicla tutte le schede nell'ordine corretto appena calcolato
        griglia.appendChild(card); // Inserisce nuovamente la scheda nella griglia: JavaScript sposta l'elemento HTML esistente in fondo, aggiornandone la posizione visiva
      });
    });
  });

  //Alla fine dello script chiama aggiorna() una volta, così il contatore viene impostato correttamente appena la pagina si carica
  aggiorna();
})();
