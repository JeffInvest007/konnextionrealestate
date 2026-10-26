/* Partial lead capture (added 2026-10-26).
   Turns a lead form into two steps: name + phone first, then the rest.
   The moment step 1 is done, Jeff gets a "PARTIAL LEAD (name + phone only)" email,
   so a visitor who quits on step 2 still leaves a number to call.
   If they finish, the normal lead email still goes out as before.
   Usage: PartialLead({form:'#id', name:'#nameInput', phone:'#phoneInput', key:'web3forms key (optional if form has access_key)',
                       site:'example.com', brand:'Business name', btnClass:'btn', noteClass:'fine', moveBefore:'#firstFieldInput (optional)'}) */
(function(){
  var T = {
    en:{go:"Continue →", name:"Please enter your name.", phone:"Please enter a 10-digit phone number.",
        consent:"By clicking Continue you agree that {b} may call or text you at this number about your property, including by automated means. Message and data rates may apply. Consent is not a condition of any sale. Reply STOP to opt out."},
    es:{go:"Continuar →", name:"Por favor escriba su nombre.", phone:"Por favor escriba un número de teléfono de 10 dígitos.",
        consent:"Al oprimir Continuar usted acepta que {b} le llame o le envíe mensajes de texto a este número sobre su propiedad, incluso por medios automatizados. Pueden aplicar tarifas de mensajes y datos. El consentimiento no es condición de ninguna venta. Responda STOP para cancelar."},
    ht:{go:"Kontinye →", name:"Tanpri ekri non ou.", phone:"Tanpri mete yon nimewo telefòn 10 chif.",
        consent:"Lè ou klike Kontinye, ou dakò {b} ka rele ou oswa voye tèks ba ou nan nimewo sa a konsènan pwopriyete ou a, menm ak sistèm otomatik. Tarif mesaj ak done ka aplike. Konsantman an pa yon kondisyon pou okenn vant. Reponn STOP pou sispann."},
    fr:{go:"Continuer →", name:"Veuillez entrer votre nom.", phone:"Veuillez entrer un numéro de téléphone à 10 chiffres.",
        consent:"En cliquant sur Continuer, vous acceptez que {b} vous appelle ou vous envoie des textos à ce numéro au sujet de votre propriété, y compris par des moyens automatisés. Des frais de messages et de données peuvent s'appliquer. Le consentement n'est pas une condition de vente. Répondez STOP pour vous désabonner."}
  };
  var TAG = {es:" [ESPANOL]", ht:" [KREYOL]", fr:" [FRANCAIS]"};
  function lang(){ var l=(document.documentElement.getAttribute("lang")||"en").toLowerCase().slice(0,2); return T[l]?l:"en"; }
  function digits(s){ return (s||"").replace(/\D/g,""); }
  function store(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }

  window.PartialLead = function(cfg){
    function init(){
      var form=document.querySelector(cfg.form); if(!form || form.__pl) return; form.__pl=true;
      var nm=form.querySelector(cfg.name), ph=form.querySelector(cfg.phone); if(!nm||!ph) return;
      function wrap(inp){ var el=inp; while(el.parentElement && el.parentElement!==form && !el.parentElement.querySelector("input:not([type=hidden]):not(#"+inp.id+"),select,textarea")) el=el.parentElement; return el; }
      var wN=wrap(nm), wP=wrap(ph);
      function top(el){ while(el.parentElement && el.parentElement!==form) el=el.parentElement; return el; }

      if(cfg.moveBefore){
        var mb=form.querySelector(cfg.moveBefore);
        if(mb){ var tgt=top(mb), blk=top(wP); if(tgt!==blk && top(wN)===blk) form.insertBefore(blk,tgt); }
      }

      var hidden=[], collapsed=[], keep=[wN,wP];
      function isField(el){ return el.matches("input:not([type=hidden]),select,textarea,button") || !!el.querySelector("input:not([type=hidden]),select,textarea,button"); }
      function hide(el){ hidden.push([el,el.style.display]); el.style.display="none"; }
      var firstSeen=false;
      function walk(box){
        var kids=[].slice.call(box.children), vis=0;
        kids.forEach(function(el){
          if(el.matches("input[type=hidden],script,style,.hp,.hp-field,[name=botcheck]")) return;
          if(keep.indexOf(el)>-1){ firstSeen=true; vis++; return; }
          if(keep.some(function(k){ return el.contains(k); })){ firstSeen=true; vis+=walk(el)>0?1:0; return; }
          if(!firstSeen && !isField(el)){ vis++; return; }  /* headings and intro text above the fields stay */
          if(el.offsetParent===null && el.style.display==="none") return;
          hide(el);
        });
        if(box!==form && vis===1 && getComputedStyle(box).display==="grid"){ collapsed.push([box,box.style.gridTemplateColumns]); box.style.gridTemplateColumns="1fr"; }
        return vis;
      }
      walk(form);

      var blockAfter=top(wP); if(top(wN)!==blockAfter && blockAfter.compareDocumentPosition(top(wN)) & 4) blockAfter=top(wN);
      var box=document.createElement("div"); box.className="pl-step1"; box.style.cssText="margin-top:10px";
      var err=document.createElement("p"); err.setAttribute("role","alert"); err.style.cssText="display:none;color:#b42318;font-weight:600;font-size:.9rem;margin:0 0 8px";
      var btn=document.createElement("button"); btn.type="button"; btn.className=cfg.btnClass||"btn"; btn.style.cssText="width:100%";
      var note=document.createElement("p"); note.className=cfg.noteClass||""; note.style.cssText="margin-top:10px;font-size:.78rem;line-height:1.45;opacity:.85";
      box.appendChild(err); box.appendChild(btn); box.appendChild(note);
      blockAfter.parentNode.insertBefore(box, blockAfter.nextSibling);

      function paint(){ var t=T[lang()]; btn.textContent=t.go; note.textContent=t.consent.replace("{b}",cfg.brand||cfg.site); if(err.dataset.k) err.textContent=t[err.dataset.k]; }
      paint();
      new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});

      var step=1;
      function showErr(k,el){ err.dataset.k=k; err.textContent=T[lang()][k]; err.style.display="block"; try{ el.focus(); }catch(e){} }
      function send(){
        try{
          var bc=form.querySelector('[name="botcheck"]'); if(bc && (bc.checked || (bc.type!=="checkbox" && bc.value))) return;
          var n=nm.value.trim(), p=ph.value.trim(), sk="pl_sent_"+digits(p);
          if(store(sk)) return; store(sk,"1");
          var kEl=form.querySelector('input[name="access_key"]'), key=cfg.key||(kEl&&kEl.value); if(!key) return;
          var l=lang(), fd=new FormData();
          fd.append("access_key",key);
          fd.append("subject","PARTIAL LEAD"+(TAG[l]||"")+" (name + phone only)  "+p+"  |  "+n+"  |  "+cfg.site);
          fd.append("from_name",cfg.site+" website");
          fd.append("Name",n); fd.append("Phone",p);
          fd.append("Status","Gave name and phone on step 1, nothing else yet. If a full lead email with this phone does not follow in a few minutes, they dropped out. Call them.");
          fd.append("Site",cfg.site); if(cfg.label) fd.append("Form",cfg.label);
          fd.append("Page language",l);
          fd.append("page_source",(document.referrer||"direct")+" | "+location.href);
          fd.append("submitted_at",new Date().toLocaleString("en-US",{timeZone:"America/New_York"})+" ET");
          fetch("https://api.web3forms.com/submit",{method:"POST",body:fd,keepalive:true}).catch(function(){});
          if(typeof gtag==="function"){ try{ gtag("event","lead_partial",{site:cfg.site}); }catch(e){} }
        }catch(e){}
      }
      function reveal(){
        step=2; box.style.display="none";
        hidden.forEach(function(h){ h[0].style.display=h[1]; });
        collapsed.forEach(function(c){ c[0].style.gridTemplateColumns=c[1]; });
        var nx=[].slice.call(form.querySelectorAll("input:not([type=hidden]):not([name=botcheck]),select,textarea")).filter(function(x){ return x!==nm && x!==ph && x.offsetParent!==null; })[0];
        if(nx && window.innerWidth>760){ try{ nx.focus({preventScroll:true}); }catch(e){} }
      }
      function go(){
        if(nm.value.trim().length<2) return showErr("name",nm);
        if(digits(ph.value).replace(/^1(?=\d{10}$)/,"").length!==10) return showErr("phone",ph);
        err.style.display="none"; err.dataset.k="";
        send(); reveal();
      }
      btn.addEventListener("click",go);
      /* Enter key on step 1 continues instead of submitting a half-empty form */
      document.addEventListener("submit",function(e){ if(e.target===form && step===1){ e.preventDefault(); e.stopImmediatePropagation(); go(); } },true);
      form.addEventListener("keydown",function(e){ if(step===1 && e.key==="Enter" && e.target.tagName!=="TEXTAREA"){ e.preventDefault(); go(); } });
      /* a "clear form" or reset puts the visitor back on step 1 */
      form.addEventListener("reset",function(){ setTimeout(function(){ if(step===2){ step=1; box.style.display=""; hidden.forEach(function(h){ h[0].style.display="none"; }); collapsed.forEach(function(c){ c[0].style.gridTemplateColumns="1fr"; }); } },0); });
      if(cfg.clearBtn){ var cb=document.querySelector(cfg.clearBtn); if(cb) cb.addEventListener("click",function(){ form.dispatchEvent(new Event("reset")); }); }
      window.PartialLead._forms=(window.PartialLead._forms||[]).concat([{form:form,go:go,reveal:reveal}]);
    }
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  };
})();
