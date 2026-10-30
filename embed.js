/* Intègre la calculette EU ETS 2 dans une page (WordPress ou autre).
   Collage dans la page, bloc « HTML personnalisé » :
     <div id="ets2-calculateur"></div>
     <script src="https://calculateur-ets2.vercel.app/embed.js" defer></script>
   Le script crée le cadre, ajuste sa hauteur au contenu, remonte en haut du calculateur au changement d'onglet
   et transmet à la calculette les paramètres UTM de la page hôte ainsi que son adresse. */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var base = new URL(script.src).origin;
  var host = document.getElementById('ets2-calculateur');
  if (!host) return;

  var params = new URLSearchParams({ embed: '1', from: location.pathname });
  var here = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { if (here.get(k)) params.set(k, here.get(k)); });

  var f = document.createElement('iframe');
  f.src = base + '/?' + params.toString();
  f.title = 'Calculateur EU ETS 2 : impact de la taxe carbone sur votre flotte';
  f.scrolling = 'no';
  f.setAttribute('style', 'display:block;width:100%;min-height:720px;border:0;overflow:hidden;background:transparent');
  host.appendChild(f);

  window.addEventListener('message', function (e) {
    if (e.origin !== base || e.source !== f.contentWindow || !e.data) return;
    if (e.data.type === 'ets2:height' && typeof e.data.height === 'number' && e.data.height > 0) {
      f.style.height = e.data.height + 'px';
      f.style.minHeight = '0';
    } else if (e.data.type === 'ets2:scroll') {
      var y = f.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  });
})();
