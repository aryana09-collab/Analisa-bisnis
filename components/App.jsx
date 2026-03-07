import { useState, useRef, useEffect } from "react";

const T = {
  navy:"#0D1B2A", navy2:"#12263A", navy3:"#1A3350",
  gold:"#C9A84C", gold2:"#E8C86A",
  cream:"#F5F0E8", cream2:"#EDE6D6",
  muted:"#7A8BA0", border:"rgba(201,168,76,0.18)",
  green:"#2ECC8E", red:"#E05C5C", amber:"#F0A500",
};
const F = { display:"'Playfair Display', Georgia, serif", body:"'Lato','Trebuchet MS',sans-serif", mono:"'Courier New',monospace" };
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// BENCHMARK DATA per industri
const BENCHMARK = {
  "Manufaktur":    { current:1.8, der:1.0, npm:8.5,  roe:14.0, ebitda:16.0, cost_rev:72, ocf:12 },
  "Perdagangan":   { current:1.5, der:0.9, npm:6.5,  roe:12.0, ebitda:10.0, cost_rev:78, ocf:8  },
  "Teknologi":     { current:2.0, der:0.6, npm:15.0, roe:18.0, ebitda:28.0, cost_rev:55, ocf:20 },
  "Kuliner/F&B":   { current:1.2, der:1.2, npm:5.0,  roe:10.0, ebitda:12.0, cost_rev:80, ocf:9  },
  "Properti":      { current:1.6, der:1.5, npm:12.0, roe:11.0, ebitda:20.0, cost_rev:65, ocf:10 },
  "Jasa/Konsultan":{ current:1.4, der:0.5, npm:18.0, roe:22.0, ebitda:25.0, cost_rev:52, ocf:18 },
  "Kesehatan":     { current:1.7, der:0.8, npm:10.0, roe:15.0, ebitda:18.0, cost_rev:68, ocf:14 },
  "Lainnya":       { current:1.5, der:1.0, npm:8.0,  roe:13.0, ebitda:15.0, cost_rev:70, ocf:11 },
};

// ── Shared Components ──────────────────────────────────────────
const Logo = ({ size=24 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ width:size+8, height:size+8, borderRadius:8, background:`linear-gradient(135deg,${T.gold},${T.gold2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.65 }}>⚖</div>
    <span style={{ fontSize:size, fontWeight:700, fontFamily:F.display, color:T.cream }}>FinLens</span>
  </div>
);

const StepBar = ({ steps, current }) => (
  <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
    {steps.map((s,i) => (
      <div key={s} style={{ display:"flex", alignItems:"center", flex: i<steps.length-1?1:0 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:i<current?T.green:i===current?T.gold:T.navy3, border:`2px solid ${i<current?T.green:i===current?T.gold:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:i<=current?T.navy:T.muted, fontFamily:F.mono }}>
            {i<current?"✓":i+1}
          </div>
          <span style={{ fontSize:10, color:i===current?T.gold:i<current?T.green:T.muted, fontFamily:F.body, whiteSpace:"nowrap" }}>{s}</span>
        </div>
        {i<steps.length-1 && <div style={{ flex:1, height:2, background:i<current?T.green:T.border, margin:"0 4px", marginBottom:16 }} />}
      </div>
    ))}
  </div>
);

const Inp = ({ label, type="text", placeholder, value, onChange, hint, autoFocus }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ fontSize:11, color:T.muted, fontFamily:F.body, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>{label}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} autoFocus={autoFocus}
      style={{ width:"100%", background:T.navy3, border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 14px", color:T.cream, fontSize:14, fontFamily:F.body, outline:"none", boxSizing:"border-box" }}
      onFocus={e=>e.target.style.borderColor=T.gold+"88"} onBlur={e=>e.target.style.borderColor=T.border} />
    {hint && <div style={{ fontSize:11, color:T.muted, fontFamily:F.body, marginTop:4 }}>{hint}</div>}
  </div>
);

const Btn = ({ children, onClick, disabled, outline, sm }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ width:"100%", padding:sm?"9px":"13px", borderRadius:9, border:outline?`1px solid ${T.border}`:"none", background:disabled?T.navy3:outline?"transparent":`linear-gradient(135deg,${T.gold},${T.gold2})`, color:disabled?T.muted:outline?T.cream2:T.navy, fontSize:sm?13:14, fontWeight:700, cursor:disabled?"not-allowed":"pointer", fontFamily:F.body, transition:"all 0.2s" }}>
    {children}
  </button>
);

const Badge = ({ status }) => {
  const c = { SEHAT:{bg:T.green+"22",color:T.green}, WASPADA:{bg:T.amber+"22",color:T.amber}, KRITIS:{bg:T.red+"22",color:T.red} }[status]||{bg:T.amber+"22",color:T.amber};
  return <span style={{ background:c.bg, color:c.color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, fontFamily:F.body }}>{status}</span>;
};

const ScoreRing = ({ score, size=70 }) => {
  const color = score>=70?T.green:score>=45?T.amber:T.red;
  const r=size*0.4, c2=2*Math.PI*r, offset=c2-(score/100)*c2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.navy3} strokeWidth={size*0.1}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*0.1} strokeDasharray={c2} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2-3} textAnchor="middle" fill={color} fontSize={size*0.22} fontWeight={700} fontFamily={F.mono}>{score}</text>
      <text x={size/2} y={size/2+size*0.15} textAnchor="middle" fill={T.muted} fontSize={size*0.11} fontFamily={F.body}>/100</text>
    </svg>
  );
};

// Split layout
const AuthLayout = ({ left, right, step, total }) => (
  <div style={{ minHeight:"100vh", display:"flex", background:T.navy }}>

    <div style={{ width:"40%", background:T.navy2, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", padding:"36px 44px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", bottom:-80, right:-80, width:280, height:280, borderRadius:"50%", background:`radial-gradient(circle,${T.gold}0D,transparent 70%)` }}/>
      <Logo/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>{left}</div>
      {step && <div style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>Langkah {step} dari {total}</div>}
    </div>
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"36px 48px" }}>
      <div style={{ width:"100%", maxWidth:420 }}>{right}</div>
    </div>
  </div>
);

// ── AUTH SCREENS ───────────────────────────────────────────────
const Landing = ({ onDaftar, onMasuk }) => (
  <AuthLayout
    left={<div>
      <h1 style={{ fontSize:32, fontWeight:700, fontFamily:F.display, color:T.cream, lineHeight:1.25, margin:"0 0 14px" }}>Analisis Keuangan Bisnis Anda<br/><span style={{ color:T.gold }}>Otomatis & Akurat</span></h1>
      <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7, margin:"0 0 24px" }}>Upload laporan keuangan. AI kami analisis semua rasio, deteksi risiko, dan kasih rekomendasi strategis untuk bisnis Anda.</p>
      {["📊 30+ rasio keuangan otomatis","💵 Analisis cash flow & arus kas","⚠️ Early warning sebelum masalah terjadi","💬 Tanya AI tentang keuangan bisnis Anda","📄 Laporan PDF siap ke bank/investor"].map(f=>(
        <div key={f} style={{ fontSize:13, color:T.cream2, fontFamily:F.body, marginBottom:8 }}>{f}</div>
      ))}
    </div>}
    right={<div>
      <h2 style={{ fontSize:22, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 6px" }}>Mulai Sekarang</h2>
      <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 24px" }}>Trial 5 hari gratis · Tidak perlu kartu kredit</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
        <Btn onClick={onDaftar}>Daftar Gratis →</Btn>
        <Btn outline onClick={onMasuk}>Sudah punya akun? Masuk</Btn>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ flex:1, height:1, background:T.border }}/><span style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>atau</span><div style={{ flex:1, height:1, background:T.border }}/>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {["G  Google","M  Microsoft"].map(p=><button key={p} style={{ flex:1, padding:10, borderRadius:8, border:`1px solid ${T.border}`, background:T.navy2, color:T.cream2, fontSize:13, fontFamily:F.body, cursor:"pointer" }}>{p}</button>)}
      </div>
    </div>}
  />
);

const StepEmail = ({ onNext }) => {
  const [nama,setNama]=useState(""); const [email,setEmail]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit = () => {
    if(!nama.trim()) return setErr("Nama lengkap wajib diisi");
    if(!email.includes("@")||!email.includes(".")) return setErr("Format email tidak valid");
    setErr(""); setLoading(true);
    setTimeout(()=>{ setLoading(false); onNext(nama,email,generateOTP()); },1200);
  };
  return (
    <AuthLayout step={1} total={3}
      left={<div>
        <div style={{ fontSize:38, marginBottom:16 }}>👋</div>
        <h2 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Hai, kenalan dulu!</h2>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7 }}>Masukkan nama dan email Anda. Kami kirim kode verifikasi ke email — prosesnya cepat!</p>
        <div style={{ marginTop:24, background:T.navy3, borderRadius:10, padding:14 }}>
          <div style={{ fontSize:12, color:T.gold, fontFamily:F.body, fontWeight:700, marginBottom:6 }}>Kenapa verifikasi email?</div>
          <div style={{ fontSize:12, color:T.muted, fontFamily:F.body, lineHeight:1.6 }}>Untuk memastikan akun Anda aman dan email yang dimasukkan benar-benar milik Anda.</div>
        </div>
      </div>}
      right={<div>
        <StepBar steps={["Email","Verifikasi OTP","Buat Password"]} current={0}/>
        <h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 4px" }}>Daftar Akun Baru</h2>
        <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 20px" }}>Isi nama dan email, kami kirimkan kode verifikasi</p>
        <Inp label="Nama Lengkap" placeholder="Budi Santoso" value={nama} onChange={e=>setNama(e.target.value)} autoFocus/>
        <Inp label="Alamat Email" type="email" placeholder="budi@perusahaan.com" value={email} onChange={e=>setEmail(e.target.value)} hint="Kode OTP akan dikirim ke email ini"/>
        {err && <div style={{ background:`${T.red}18`, border:`1px solid ${T.red}44`, borderRadius:8, padding:"9px 14px", color:T.red, fontSize:12, fontFamily:F.body, marginBottom:12 }}>⚠️ {err}</div>}
        <Btn onClick={submit} disabled={loading}>{loading?"Mengirim kode OTP...":"Kirim Kode Verifikasi →"}</Btn>
      </div>}
    />
  );
};

const StepOTP = ({ email, otpCode, onNext, onBack }) => {
  const [digits,setDigits]=useState(["","","","","",""]); const [err,setErr]=useState(""); const [cd,setCd]=useState(60); const [resent,setResent]=useState(false); const [otp,setOtp]=useState(otpCode);
  const refs=[useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  useEffect(()=>{ refs[0].current?.focus(); const t=setInterval(()=>setCd(c=>c>0?c-1:0),1000); return()=>clearInterval(t); },[]);
  const handleChange=(i,val)=>{
    if(!/^\d?$/.test(val)) return;
    const n=[...digits]; n[i]=val; setDigits(n); setErr("");
    if(val&&i<5) refs[i+1].current?.focus();
    if(n.every(d=>d!=="")){ if(n.join("")===otp) setTimeout(onNext,300); else{ setErr("Kode salah. Coba lagi."); setDigits(["","","","","",""]); refs[0].current?.focus(); } }
  };
  const handleKey=(i,e)=>{ if(e.key==="Backspace"&&!digits[i]&&i>0) refs[i-1].current?.focus(); };
  const resend=()=>{ const f=generateOTP(); setOtp(f); setDigits(["","","","","",""]); setResent(true); setCd(60); setErr(""); refs[0].current?.focus(); };
  return (
    <AuthLayout step={2} total={3}
      left={<div>
        <div style={{ fontSize:38, marginBottom:16 }}>📧</div>
        <h2 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Cek email Anda</h2>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7, margin:"0 0 16px" }}>Kode 6 digit dikirim ke<br/><span style={{ color:T.gold, fontWeight:600 }}>{email}</span></p>
        <div style={{ background:T.navy3, borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:12, color:T.muted, fontFamily:F.body, lineHeight:1.6 }}>💡 Cek folder <strong style={{ color:T.cream2 }}>Spam</strong> jika tidak ada di Inbox. Berlaku <strong style={{ color:T.cream2 }}>10 menit</strong>.</div>
        </div>
        <div style={{ background:`${T.gold}12`, border:`1px solid ${T.gold}33`, borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:11, color:T.gold, fontFamily:F.body, fontWeight:700, marginBottom:4 }}>🎯 Mode Demo</div>
          <div style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>Kode OTP Anda:</div>
          <div style={{ fontSize:24, fontWeight:700, fontFamily:F.mono, color:T.gold2, letterSpacing:6, marginTop:4 }}>{otp}</div>
        </div>
      </div>}
      right={<div>
        <StepBar steps={["Email","Verifikasi OTP","Buat Password"]} current={1}/>
        <h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 4px" }}>Masukkan Kode OTP</h2>
        <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 24px" }}>Kode 6 digit yang dikirim ke email Anda</p>
        <div style={{ display:"flex", gap:8, marginBottom:14, justifyContent:"center" }}>
          {digits.map((d,i)=>(
            <input key={i} ref={refs[i]} maxLength={1} value={d} onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKey(i,e)}
              style={{ width:52, height:62, textAlign:"center", background:T.navy3, border:`2px solid ${d?T.gold+"88":err?T.red+"66":T.border}`, borderRadius:10, color:T.cream, fontSize:26, fontFamily:F.mono, fontWeight:700, outline:"none" }}/>
          ))}
        </div>
        {err && <div style={{ background:`${T.red}18`, border:`1px solid ${T.red}44`, borderRadius:8, padding:"9px 14px", color:T.red, fontSize:12, fontFamily:F.body, marginBottom:12 }}>⚠️ {err}</div>}
        {resent && <div style={{ background:`${T.green}18`, border:`1px solid ${T.green}44`, borderRadius:8, padding:"9px 14px", color:T.green, fontSize:12, fontFamily:F.body, marginBottom:12 }}>✓ Kode baru dikirim! Cek panel kiri.</div>}
        <div style={{ textAlign:"center", marginBottom:20 }}>
          {cd>0?<span style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>Kirim ulang dalam <strong style={{ color:T.cream2 }}>{cd}d</strong></span>
            :<span onClick={resend} style={{ fontSize:13, color:T.gold, cursor:"pointer", fontFamily:F.body, fontWeight:600 }}>Kirim ulang kode</span>}
        </div>
        <button onClick={onBack} style={{ width:"100%", padding:10, borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:F.body }}>← Ganti email</button>
      </div>}
    />
  );
};

const StepPassword = ({ nama, onDone }) => {
  const [pass,setPass]=useState(""); const [confirm,setConfirm]=useState(""); const [show,setShow]=useState(false); const [err,setErr]=useState("");
  const strength = pass.length===0?0:pass.length<6?1:pass.length<10?2:/[A-Z]/.test(pass)&&/[0-9]/.test(pass)?3:2;
  const sColor=[T.border,T.red,T.amber,T.green][strength];
  const submit=()=>{ if(pass.length<8) return setErr("Password minimal 8 karakter"); if(pass!==confirm) return setErr("Password tidak cocok"); onDone(); };
  return (
    <AuthLayout step={3} total={3}
      left={<div>
        <div style={{ fontSize:38, marginBottom:16 }}>🔐</div>
        <h2 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Hampir selesai, {nama.split(" ")[0]}!</h2>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7 }}>Buat password yang kuat untuk melindungi akun dan data keuangan bisnis Anda.</p>
      </div>}
      right={<div>
        <StepBar steps={["Email","Verifikasi OTP","Buat Password"]} current={2}/>
        <h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 4px" }}>Buat Password</h2>
        <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 20px" }}>Digunakan untuk masuk ke akun FinLens Anda</p>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, color:T.muted, fontFamily:F.body, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>Password Baru</label>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} placeholder="Minimal 8 karakter" value={pass} onChange={e=>setPass(e.target.value)} autoFocus
              style={{ width:"100%", background:T.navy3, border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 44px 11px 14px", color:T.cream, fontSize:14, fontFamily:F.body, outline:"none", boxSizing:"border-box" }}/>
            <button onClick={()=>setShow(!show)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, cursor:"pointer" }}>{show?"🙈":"👁"}</button>
          </div>
          {pass.length>0 && <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:6 }}>
            {[1,2,3].map(n=><div key={n} style={{ flex:1, height:4, borderRadius:2, background:n<=strength?sColor:T.navy3 }}/>)}
            <span style={{ fontSize:10, color:sColor, fontFamily:F.body, marginLeft:6 }}>{["","Lemah","Cukup","Kuat"][strength]}</span>
          </div>}
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, color:T.muted, fontFamily:F.body, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>Konfirmasi Password</label>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} placeholder="Ulangi password" value={confirm} onChange={e=>setConfirm(e.target.value)}
              style={{ width:"100%", background:T.navy3, border:`1px solid ${confirm?(confirm===pass?T.green+"88":T.red+"66"):T.border}`, borderRadius:8, padding:"11px 44px 11px 14px", color:T.cream, fontSize:14, fontFamily:F.body, outline:"none", boxSizing:"border-box" }}/>
            {confirm && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)" }}>{confirm===pass?"✅":"❌"}</span>}
          </div>
        </div>
        {err && <div style={{ background:`${T.red}18`, border:`1px solid ${T.red}44`, borderRadius:8, padding:"9px 14px", color:T.red, fontSize:12, fontFamily:F.body, marginBottom:12 }}>⚠️ {err}</div>}
        <Btn onClick={submit}>Selesai & Masuk →</Btn>
      </div>}
    />
  );
};

const Login = ({ onMasuk, onDaftar, onForgot }) => {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [show,setShow]=useState(false);
  return (
    <AuthLayout
      left={<div>
        <div style={{ fontSize:38, marginBottom:16 }}>🔑</div>
        <h2 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Selamat kembali!</h2>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7 }}>Masuk untuk melihat kondisi keuangan bisnis Anda hari ini.</p>
      </div>}
      right={<div>
        <h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 4px" }}>Masuk ke Akun</h2>
        <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 20px" }}>Gunakan email dan password yang sudah didaftarkan</p>
        <Inp label="Email" type="email" placeholder="budi@perusahaan.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <label style={{ fontSize:11, color:T.muted, fontFamily:F.body, textTransform:"uppercase", letterSpacing:0.8 }}>Password</label>
            <span onClick={onForgot} style={{ fontSize:11, color:T.gold, cursor:"pointer", fontFamily:F.body }}>Lupa password?</span>
          </div>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} placeholder="Password Anda" value={pass} onChange={e=>setPass(e.target.value)}
              style={{ width:"100%", background:T.navy3, border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 44px 11px 14px", color:T.cream, fontSize:14, fontFamily:F.body, outline:"none", boxSizing:"border-box" }}/>
            <button onClick={()=>setShow(!show)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, cursor:"pointer" }}>{show?"🙈":"👁"}</button>
          </div>
        </div>
        <Btn onClick={onMasuk}>Masuk →</Btn>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0" }}>
          <div style={{ flex:1, height:1, background:T.border }}/><span style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>atau</span><div style={{ flex:1, height:1, background:T.border }}/>
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          {["G  Google","M  Microsoft"].map(p=><button key={p} style={{ flex:1, padding:10, borderRadius:8, border:`1px solid ${T.border}`, background:T.navy2, color:T.cream2, fontSize:13, fontFamily:F.body, cursor:"pointer" }}>{p}</button>)}
        </div>
        <p style={{ textAlign:"center", fontSize:13, color:T.muted, fontFamily:F.body, margin:0 }}>Belum punya akun? <span onClick={onDaftar} style={{ color:T.gold, cursor:"pointer", fontWeight:600 }}>Daftar gratis</span></p>
      </div>}
    />
  );
};

const ForgotPassword = ({ onBack }) => {
  const [step,setStep]=useState("email"); const [email,setEmail]=useState(""); const [otp,setOtp]=useState(""); const [digits,setDigits]=useState(["","","","","",""]); const [pass,setPass]=useState(""); const [confirm,setConfirm]=useState("");
  const refs=[useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const sendOtp=()=>{ const o=generateOTP(); setOtp(o); setStep("otp"); setTimeout(()=>refs[0].current?.focus(),100); };
  const handleDigit=(i,val)=>{ if(!/^\d?$/.test(val)) return; const n=[...digits]; n[i]=val; setDigits(n); if(val&&i<5) refs[i+1].current?.focus(); if(n.every(d=>d!=="")&&n.join("")===otp) setStep("newpass"); };
  const handleKey=(i,e)=>{ if(e.key==="Backspace"&&!digits[i]&&i>0) refs[i-1].current?.focus(); };
  return (
    <AuthLayout
      left={<div>
        <div style={{ fontSize:38, marginBottom:16 }}>{step==="email"?"🔒":step==="otp"?"📧":"🔑"}</div>
        <h2 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>{step==="email"?"Lupa Password?":step==="otp"?"Verifikasi Identitas":"Password Baru"}</h2>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7 }}>{step==="email"?"Masukkan email terdaftar, kami kirim kode OTP.":step==="otp"?`Kode dikirim ke ${email}.`:"Buat password baru yang kuat."}</p>
        {step==="otp" && <div style={{ marginTop:16, background:`${T.gold}12`, border:`1px solid ${T.gold}33`, borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:11, color:T.gold, fontFamily:F.body, fontWeight:700, marginBottom:4 }}>🎯 Demo OTP</div>
          <div style={{ fontSize:24, fontFamily:F.mono, color:T.gold2, letterSpacing:6 }}>{otp}</div>
        </div>}
      </div>}
      right={<div>
        <StepBar steps={["Email","Verifikasi OTP","Password Baru"]} current={step==="email"?0:step==="otp"?1:2}/>
        {step==="email" && <><h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 16px" }}>Masukkan Email Anda</h2><Inp label="Email terdaftar" type="email" placeholder="budi@perusahaan.com" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/><Btn onClick={sendOtp} disabled={!email.includes("@")}>Kirim Kode OTP →</Btn><p style={{ textAlign:"center", marginTop:14, fontSize:13 }}><span onClick={onBack} style={{ color:T.gold, cursor:"pointer", fontFamily:F.body }}>← Kembali ke halaman masuk</span></p></>}
        {step==="otp" && <><h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 16px" }}>Masukkan Kode OTP</h2><div style={{ display:"flex", gap:8, marginBottom:20, justifyContent:"center" }}>{digits.map((d,i)=><input key={i} ref={refs[i]} maxLength={1} value={d} onChange={e=>handleDigit(i,e.target.value)} onKeyDown={e=>handleKey(i,e)} style={{ width:52, height:62, textAlign:"center", background:T.navy3, border:`2px solid ${d?T.gold+"88":T.border}`, borderRadius:10, color:T.cream, fontSize:26, fontFamily:F.mono, fontWeight:700, outline:"none" }}/>)}</div><button onClick={()=>setStep("email")} style={{ width:"100%", padding:10, borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:F.body }}>← Ganti email</button></>}
        {step==="newpass" && <><h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 16px" }}>Buat Password Baru</h2><Inp label="Password Baru" type="password" placeholder="Minimal 8 karakter" value={pass} onChange={e=>setPass(e.target.value)} autoFocus/><Inp label="Konfirmasi" type="password" placeholder="Ulangi password" value={confirm} onChange={e=>setConfirm(e.target.value)}/><Btn onClick={onBack} disabled={pass.length<8||pass!==confirm}>Simpan & Masuk →</Btn></>}
      </div>}
    />
  );
};

// ── PRICING PAGE ───────────────────────────────────────────────
const PricingPage = ({ onBack, onPilih }) => {
  const plans = [
    { id:"trial", name:"Trial", harga:"Gratis", sub:"5 hari", color:T.muted, fitur:["3x analisis keuangan","Early warning system","AI Chat (10 pertanyaan)","Riwayat tersimpan"], tidak:["Export PDF","Keputusan bisnis","Multi perusahaan","Benchmark industri"] },
    { id:"A", name:"Plan A", harga:"Rp 329.000", sub:"/bulan", color:T.gold, popular:true, fitur:["Analisis keuangan unlimited","30+ rasio + cash flow","Early warning system","AI Chat unlimited","Export PDF laporan","Riwayat tersimpan"], tidak:["Keputusan bisnis","Multi perusahaan","Benchmark industri","Alert WhatsApp/email","Import Excel"] },
    { id:"B", name:"Plan B", harga:"Rp 690.000", sub:"/bulan", color:T.green, fitur:["Semua fitur Plan A","Keputusan bisnis AI","Multi perusahaan","Perbandingan perusahaan","Benchmark industri","Alert WhatsApp/email","Import Excel"] },
  ];
  return (
    <div style={{ minHeight:"100vh", background:T.navy, padding:"40px 24px" }}>
  
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 14px", color:T.muted, cursor:"pointer", fontSize:12, fontFamily:F.body, marginBottom:32 }}>← Kembali</button>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h1 style={{ fontSize:32, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Pilih Paket yang Tepat</h1>
          <p style={{ fontSize:15, color:T.muted, fontFamily:F.body }}>Mulai gratis 5 hari, upgrade kapan saja</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
          {plans.map(p=>(
            <div key={p.id} style={{ background:T.navy2, border:`2px solid ${p.popular?T.gold:T.border}`, borderRadius:16, padding:24, position:"relative", display:"flex", flexDirection:"column" }}>
              {p.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(135deg,${T.gold},${T.gold2})`, color:T.navy, borderRadius:20, padding:"3px 16px", fontSize:11, fontWeight:700, fontFamily:F.body, whiteSpace:"nowrap" }}>PALING POPULER</div>}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:14, fontWeight:700, color:p.color, fontFamily:F.body, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{p.name}</div>
                <div style={{ fontSize:28, fontWeight:700, color:T.cream, fontFamily:F.display }}>{p.harga}</div>
                <div style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>{p.sub}</div>
              </div>
              <div style={{ flex:1, marginBottom:20 }}>
                {p.fitur.map(f=><div key={f} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}><span style={{ color:T.green, fontSize:13 }}>✓</span><span style={{ fontSize:12, color:T.cream2, fontFamily:F.body, lineHeight:1.5 }}>{f}</span></div>)}
                {p.tidak?.map(f=><div key={f} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}><span style={{ color:T.muted, fontSize:13 }}>✗</span><span style={{ fontSize:12, color:T.muted, fontFamily:F.body, lineHeight:1.5 }}>{f}</span></div>)}
              </div>
              <button onClick={()=>onPilih(p.id)} style={{ width:"100%", padding:12, borderRadius:9, border:p.popular?"none":`1px solid ${p.color}44`, background:p.popular?`linear-gradient(135deg,${T.gold},${T.gold2})`:p.id==="B"?`${T.green}18`:"transparent", color:p.popular?T.navy:p.id==="B"?T.green:T.cream2, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:F.body }}>
                {p.id==="trial"?"Mulai Gratis":"Pilih Paket Ini"}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign:"center", fontSize:12, color:T.muted, fontFamily:F.body, marginTop:28 }}>Harga belum termasuk PPN · Bisa dibatalkan kapan saja · Pembayaran aman</p>
      </div>
    </div>
  );
};

// ── SIDEBAR ────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, userName, plan }) => {
  const nav=[["⬛","Dashboard"],["🏢","Perusahaan"],["⇄","Bandingkan"],["💬","AI Chat"],["💳","Paket"],["⚙","Pengaturan"]];
  return (
    <div style={{ width:200, background:T.navy2, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"18px 16px 14px", borderBottom:`1px solid ${T.border}` }}><Logo size={20}/></div>
      <nav style={{ padding:"10px 8px", flex:1 }}>
        {nav.map(([ic,l])=>(
          <div key={l} onClick={()=>setActive(l)} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px", borderRadius:7, marginBottom:2, background:active===l?`${T.gold}18`:"transparent", color:active===l?T.gold:T.muted, borderLeft:active===l?`2px solid ${T.gold}`:"2px solid transparent", cursor:"pointer" }}>
            <span style={{ fontSize:13 }}>{ic}</span>
            <span style={{ fontSize:13, fontFamily:F.body, fontWeight:active===l?600:400 }}>{l}</span>
          </div>
        ))}
      </nav>
      <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ width:28, height:28, borderRadius:"50%", background:T.navy3, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>👤</div>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:T.cream, fontFamily:F.body }}>{userName}</div>
          <div style={{ fontSize:10, color:plan==="B"?T.green:T.amber, fontFamily:F.body }}>{plan==="trial"?"Trial 5 hari":plan==="A"?"Plan A":"Plan B"}</div>
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────
const MOCK_COMPANIES = [
  { id:1, name:"PT Maju Bersama", industry:"Manufaktur", periode:"FY 2024", score:78, status:"SEHAT", trend:+5, rasio:{ current:2.1, der:0.8, npm:12.4, roe:18.2, ocf:15.3, cost_rev:64, ebitda:22 }, warnings:[{level:"KUNING",cat:"Piutang",msg:"DSO 62 hari, di atas rata-rata industri 45 hari"},{level:"HIJAU",cat:"Likuiditas",msg:"Current ratio 2.1 — posisi kas sangat aman"}], ringkasan:"PT Maju Bersama menunjukkan kondisi keuangan yang sehat dengan profitabilitas solid.", keputusan:{ investasi:"Ekspansi kapasitas layak — FCF positif Rp 4.2M", pendanaan:"DER 0.8, ruang utang masih ada hingga Rp 12M", dividen:"Dapat distribusi dividen 30-40% dari laba bersih", prioritas:"Percepat collection piutang, target DSO ≤ 45 hari" } },
  { id:2, name:"CV Sentosa Jaya", industry:"Perdagangan", periode:"FY 2024", score:51, status:"WASPADA", trend:-3, rasio:{ current:1.1, der:1.9, npm:4.2, roe:9.1, ocf:6.8, cost_rev:82, ebitda:9 }, warnings:[{level:"MERAH",cat:"Solvabilitas",msg:"DER 1.9 — beban utang terlalu tinggi"},{level:"KUNING",cat:"Profitabilitas",msg:"Net margin 4.2% di bawah industri 6.5%"}], ringkasan:"CV Sentosa Jaya berada di zona waspada. Tingkat utang tinggi jadi risiko utama.", keputusan:{ investasi:"Tunda ekspansi — perbaiki neraca dulu", pendanaan:"Prioritas lunasi utang berbiaya tinggi", dividen:"Tidak disarankan dividen tahun ini", prioritas:"Kurangi DER ke bawah 1.5 dalam 12 bulan" } },
];

const Dashboard = ({ userName, plan, onUpgrade }) => {
  const [active, setActive] = useState("Dashboard");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [chat, setChat] = useState([{ role:"ai", msg:"Halo! Saya AI FinLens. Pilih perusahaan dulu untuk mulai analisis." }]);
  const [chatInput, setChatInput] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [compareA, setCompareA] = useState(0);
  const [compareB, setCompareB] = useState(1);

  const handleChat = () => {
    if(!chatInput.trim()) return;
    const co = selectedCompany;
    const reply = co ? `Berdasarkan data ${co.name}: skor kesehatan ${co.score}/100 (${co.status}). ${co.keputusan.prioritas}` : "Silakan pilih perusahaan terlebih dahulu dari menu Perusahaan.";
    setChat([...chat, {role:"user",msg:chatInput}, {role:"ai",msg:reply}]);
    setChatInput("");
  };

  const exportPDF = (company) => {
    const content = `
LAPORAN ANALISIS KEUANGAN - FINLENS
=====================================
Perusahaan : ${company.name}
Industri   : ${company.industry}
Periode    : ${company.periode}
Tanggal    : ${new Date().toLocaleDateString("id-ID")}

SKOR KESEHATAN KEUANGAN: ${company.score}/100 (${company.status})

RINGKASAN EKSEKUTIF
-------------------
${company.ringkasan}

RASIO KEUANGAN UTAMA
---------------------
Current Ratio      : ${company.rasio.current}x
Debt/Equity Ratio  : ${company.rasio.der}x
Net Profit Margin  : ${company.rasio.npm}%
Return on Equity   : ${company.rasio.roe}%
EBITDA Margin      : ${company.rasio.ebitda}%
OCF/Revenue        : ${company.rasio.ocf}%
Cost/Revenue       : ${company.rasio.cost_rev}%

EARLY WARNING
-------------
${company.warnings.map(w=>`[${w.level}] ${w.cat}: ${w.msg}`).join("\n")}

REKOMENDASI KEPUTUSAN BISNIS
-----------------------------
Investasi  : ${company.keputusan.investasi}
Pendanaan  : ${company.keputusan.pendanaan}
Dividen    : ${company.keputusan.dividen}
PRIORITAS  : ${company.keputusan.prioritas}

=====================================
Dibuat oleh FinLens AI · finlens.id
    `;
    const blob = new Blob([content], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `FinLens_${company.name}_${company.periode}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const BenchmarkView = ({ company }) => {
    const bm = BENCHMARK[company.industry] || BENCHMARK["Lainnya"];
    const metrics = [
      { label:"Net Profit Margin", val:company.rasio.npm, ind:bm.npm, suffix:"%", high:true },
      { label:"Return on Equity", val:company.rasio.roe, ind:bm.roe, suffix:"%", high:true },
      { label:"Current Ratio", val:company.rasio.current, ind:bm.current, suffix:"x", high:true },
      { label:"Debt/Equity", val:company.rasio.der, ind:bm.der, suffix:"x", high:false },
      { label:"EBITDA Margin", val:company.rasio.ebitda, ind:bm.ebitda, suffix:"%", high:true },
      { label:"Cost/Revenue", val:company.rasio.cost_rev, ind:bm.cost_rev, suffix:"%", high:false },
      { label:"OCF/Revenue", val:company.rasio.ocf, ind:bm.ocf, suffix:"%", high:true },
    ];
    return (
      <div style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.cream, fontFamily:F.body, marginBottom:4 }}>📊 Benchmark vs Industri {company.industry}</div>
        <div style={{ fontSize:11, color:T.muted, fontFamily:F.body, marginBottom:16 }}>🟢 Lebih baik dari industri &nbsp;·&nbsp; 🔴 Di bawah rata-rata industri</div>
        {metrics.map(m => {
          const better = m.high ? m.val >= m.ind : m.val <= m.ind;
          const max = Math.max(m.val, m.ind) * 1.5;
          return (
            <div key={m.label} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:T.cream2, fontFamily:F.body }}>{m.label}</span>
                <div style={{ display:"flex", gap:14 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:better?T.green:T.red, fontFamily:F.mono }}>{m.val}{m.suffix}</span>
                  <span style={{ fontSize:12, color:T.muted, fontFamily:F.mono }}>~{m.ind}{m.suffix}</span>
                </div>
              </div>
              <div style={{ position:"relative", height:7, background:T.navy3, borderRadius:4 }}>
                <div style={{ position:"absolute", height:"100%", width:`${Math.min((m.ind/max)*100,100)}%`, background:T.muted+"55", borderRadius:4 }}/>
                <div style={{ position:"absolute", height:"100%", width:`${Math.min((m.val/max)*100,100)}%`, background:better?T.green:T.red, borderRadius:4 }}/>
              </div>
              <div style={{ fontSize:10, color:T.muted, fontFamily:F.body, marginTop:3 }}>Rata-rata industri: {m.ind}{m.suffix} {better?"· ✅ Anda lebih baik":"· ⚠️ Perlu ditingkatkan"}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if(active==="Paket") return (
      <div style={{ padding:"32px 36px" }}>
        <h1 style={{ fontSize:22, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 6px" }}>Paket Berlangganan</h1>
        <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 28px" }}>Paket aktif: <strong style={{ color:T.gold }}>{plan==="trial"?"Trial 5 hari":plan==="A"?"Plan A - Rp 329.000/bln":"Plan B - Rp 690.000/bln"}</strong></p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          {[
            { id:"trial", name:"Trial", harga:"Gratis", sub:"5 hari", color:T.muted, fitur:["3x analisis","Early warning","AI Chat terbatas"] },
            { id:"A", name:"Plan A", harga:"Rp 329.000", sub:"/bulan", color:T.gold, popular:true, fitur:["Analisis unlimited","30+ rasio + cash flow","AI Chat unlimited","Export PDF"] },
            { id:"B", name:"Plan B", harga:"Rp 690.000", sub:"/bulan", color:T.green, fitur:["Semua Plan A","Keputusan bisnis","Multi perusahaan","Benchmark industri","Alert otomatis","Import Excel"] },
          ].map(p=>(
            <div key={p.id} style={{ background:T.navy2, border:`2px solid ${plan===p.id?p.color:T.border}`, borderRadius:14, padding:20, position:"relative" }}>
              {plan===p.id && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:p.color, color:T.navy, borderRadius:20, padding:"2px 12px", fontSize:10, fontWeight:700, fontFamily:F.body }}>AKTIF</div>}
              <div style={{ fontSize:13, fontWeight:700, color:p.color, fontFamily:F.body, marginBottom:6 }}>{p.name}</div>
              <div style={{ fontSize:22, fontWeight:700, color:T.cream, fontFamily:F.display, marginBottom:2 }}>{p.harga}</div>
              <div style={{ fontSize:11, color:T.muted, fontFamily:F.body, marginBottom:14 }}>{p.sub}</div>
              {p.fitur.map(f=><div key={f} style={{ fontSize:12, color:T.cream2, fontFamily:F.body, marginBottom:6 }}>✓ {f}</div>)}
              {plan!==p.id && <button onClick={()=>onUpgrade(p.id)} style={{ width:"100%", padding:10, borderRadius:8, border:`1px solid ${p.color}44`, background:"transparent", color:p.color, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:F.body, marginTop:14 }}>Upgrade</button>}
            </div>
          ))}
        </div>
      </div>
    );

    if(active==="AI Chat") return (
      <div style={{ padding:"28px 32px", display:"flex", flexDirection:"column", height:"calc(100vh - 60px)" }}>
        <h2 style={{ fontSize:18, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 16px" }}>💬 AI Chat</h2>
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
          {chat.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:8 }}>
              {m.role==="ai" && <div style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${T.gold},${T.gold2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>AI</div>}
              <div style={{ maxWidth:"72%", background:m.role==="user"?`${T.gold}18`:T.navy2, border:`1px solid ${m.role==="user"?T.gold+"44":T.border}`, borderRadius:10, padding:"10px 14px" }}>
                <p style={{ fontSize:13, color:T.cream2, fontFamily:F.body, margin:0, lineHeight:1.7 }}>{m.msg}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleChat()} placeholder="Tanya tentang keuangan perusahaan..." style={{ flex:1, background:T.navy2, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 14px", color:T.cream, fontSize:13, fontFamily:F.body, outline:"none" }}/>
          <button onClick={handleChat} style={{ padding:"10px 20px", borderRadius:8, border:"none", background:`linear-gradient(135deg,${T.gold},${T.gold2})`, color:T.navy, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:F.body }}>Kirim</button>
        </div>
      </div>
    );

    if(active==="Bandingkan") {
      const a=compareA, setA=setCompareA, b=compareB, setB=setCompareB;
      const ca=MOCK_COMPANIES[a], cb=MOCK_COMPANIES[b];
      const metrics=[["Skor","score",true,""],["Net Margin","npm",true,"%"],["ROE","roe",true,"%"],["Current","current",true,"x"],["DER","der",false,"x"],["EBITDA","ebitda",true,"%"]];
      return (
        <div style={{ padding:"28px 32px" }}>
          <h2 style={{ fontSize:18, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 20px" }}>⇄ Bandingkan Perusahaan</h2>
          <div style={{ display:"flex", gap:14, marginBottom:24 }}>
            {[{val:a,set:setA,label:"Perusahaan A"},{val:b,set:setB,label:"Perusahaan B"}].map(({val,set,label})=>(
              <div key={label} style={{ flex:1 }}>
                <label style={{ fontSize:11, color:T.muted, fontFamily:F.body, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>{label}</label>
                <select value={val} onChange={e=>set(Number(e.target.value))} style={{ width:"100%", background:T.navy2, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 12px", color:T.cream, fontSize:13, fontFamily:F.body, outline:"none" }}>
                  {MOCK_COMPANIES.map((c,i)=><option key={i} value={i}>{c.name}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12 }}>
            <div style={{ background:T.navy2, border:`1px solid ${T.gold}44`, borderRadius:10, padding:16, textAlign:"center" }}>
              <ScoreRing score={ca.score} size={64}/><div style={{ fontSize:13, fontWeight:700, color:T.cream, fontFamily:F.body, marginTop:6 }}>{ca.name}</div><Badge status={ca.status}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", gap:0 }}>
              {metrics.map(([l])=><div key={l} style={{ padding:"11px 16px", fontSize:12, color:T.cream2, fontFamily:F.body, textAlign:"center", borderBottom:`1px solid ${T.border}` }}>{l}</div>)}
            </div>
            <div style={{ background:T.navy2, border:`1px solid ${T.gold}44`, borderRadius:10, padding:16, textAlign:"center" }}>
              <ScoreRing score={cb.score} size={64}/><div style={{ fontSize:13, fontWeight:700, color:T.cream, fontFamily:F.body, marginTop:6 }}>{cb.name}</div><Badge status={cb.status}/>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12, marginTop:2 }}>
            <div style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:10 }}>
              {metrics.map(([l,k,high,s])=>{ const v=k==="score"?ca[k]:ca.rasio[k]; const vb=k==="score"?cb[k]:cb.rasio[k]; const w=high?v>vb:v<vb; return <div key={l} style={{ padding:"11px 16px", textAlign:"center", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:700, color:w?T.green:T.muted, fontFamily:F.mono }}>{v}{s}</div>; })}
            </div>
            <div style={{ display:"flex", flexDirection:"column" }}>
              {metrics.map(([l,k,high])=>{ const v=k==="score"?ca[k]:ca.rasio[k]; const vb=k==="score"?cb[k]:cb.rasio[k]; const aw=high?v>vb:v<vb; const bw=high?vb>v:vb<v; return <div key={l} style={{ padding:"11px 8px", textAlign:"center", borderBottom:`1px solid ${T.border}`, fontSize:12 }}>{aw?"🏆":bw?"  ":"="}</div>; })}
            </div>
            <div style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:10 }}>
              {metrics.map(([l,k,high,s])=>{ const v=k==="score"?ca[k]:ca.rasio[k]; const vb=k==="score"?cb[k]:cb.rasio[k]; const w=high?vb>v:vb<v; return <div key={l} style={{ padding:"11px 16px", textAlign:"center", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:700, color:w?T.green:T.muted, fontFamily:F.mono }}>{vb}{s}</div>; })}
            </div>
          </div>
        </div>
      );
    }

    if((active==="Dashboard"||active==="Perusahaan") && !selectedCompany) return (
      <div style={{ padding:"28px 32px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 4px" }}>Dashboard</h1>
            <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:0 }}>Ringkasan semua perusahaan Anda</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setShowImportModal(true)} style={{ padding:"9px 16px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", fontSize:12, fontFamily:F.body }}>📥 Import Excel</button>
            <button style={{ padding:"9px 16px", borderRadius:8, border:"none", background:`linear-gradient(135deg,${T.gold},${T.gold2})`, color:T.navy, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:F.body }}>+ Tambah Perusahaan</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[["🏢","Total Perusahaan",MOCK_COMPANIES.length,T.gold],[" 📊","Rata-rata Skor",Math.round(MOCK_COMPANIES.reduce((a,c)=>a+c.score,0)/MOCK_COMPANIES.length),T.green],["✅","Status Sehat",MOCK_COMPANIES.filter(c=>c.status==="SEHAT").length+"/"+MOCK_COMPANIES.length,T.green],["⚠️","Perlu Perhatian",MOCK_COMPANIES.filter(c=>c.status!=="SEHAT").length,T.amber]].map(([ic,l,v,c])=>(
            <div key={l} style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:18, marginBottom:6 }}>{ic}</div>
              <div style={{ fontSize:24, fontWeight:700, color:c, fontFamily:F.mono, marginBottom:2 }}>{v}</div>
              <div style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {MOCK_COMPANIES.map(c=>(
            <div key={c.id} onClick={()=>setSelectedCompany(c)} style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:12, padding:18, cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold+"66"; e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform="none";}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div><div style={{ fontSize:14, fontWeight:700, color:T.cream, fontFamily:F.body, marginBottom:3 }}>{c.name}</div><div style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>{c.industry} · {c.periode}</div></div>
                <Badge status={c.status}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <ScoreRing score={c.score} size={56}/>
                <div>{[["Net Margin",c.rasio.npm+"%"],["ROE",c.rasio.roe+"%"],["Current",c.rasio.current+"x"]].map(([l,v])=>(
                  <div key={l} style={{ display:"flex", gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:11, color:T.muted, fontFamily:F.body, width:68 }}>{l}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:T.cream2, fontFamily:F.mono }}>{v}</span>
                  </div>
                ))}</div>
              </div>
              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>Tren vs tahun lalu</span>
                <span style={{ fontSize:12, fontWeight:700, fontFamily:F.mono, color:c.trend>0?T.green:T.red }}>{c.trend>0?"▲":"▼"} {Math.abs(c.trend)} poin</span>
              </div>
            </div>
          ))}
        </div>

        {showImportModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
            <div style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:16, padding:32, width:420 }}>
              <h3 style={{ fontSize:18, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 8px" }}>📥 Import dari Excel</h3>
              <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 20px", lineHeight:1.6 }}>Upload file Excel (.xlsx) laporan keuangan Anda. FinLens akan otomatis membaca dan menganalisis datanya.</p>
              <div style={{ border:`2px dashed ${T.border}`, borderRadius:10, padding:32, textAlign:"center", marginBottom:16, cursor:"pointer", background:T.navy3 }} onClick={()=>{ alert("Di versi production, file Excel kamu akan diproses dan dianalisis otomatis!"); setShowImportModal(false); }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📊</div>
                <div style={{ fontSize:13, color:T.cream2, fontFamily:F.body, marginBottom:4 }}>Klik untuk pilih file Excel</div>
                <div style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>.xlsx, .xls · Maks. 10MB</div>
              </div>
              <div style={{ fontSize:12, color:T.muted, fontFamily:F.body, marginBottom:16, lineHeight:1.6 }}>💡 Template Excel bisa didownload <span style={{ color:T.gold, cursor:"pointer" }}>di sini</span></div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setShowImportModal(false)} style={{ flex:1, padding:11, borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", fontFamily:F.body, fontSize:13 }}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    if(selectedCompany) {
      const tabs=["overview","rasio","benchmark","pdf"];
      const tabLabel={ overview:"Ringkasan", rasio:"Semua Rasio", benchmark:"Benchmark", pdf:"Export PDF" };
      return (
        <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
          <div style={{ padding:"16px 32px", borderBottom:`1px solid ${T.border}`, background:T.navy, display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setSelectedCompany(null)} style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:7, padding:"6px 12px", color:T.muted, cursor:"pointer", fontSize:12, fontFamily:F.body }}>← Kembali</button>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:18, fontWeight:700, fontFamily:F.display, color:T.cream }}>{selectedCompany.name}</div>
              <div style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>{selectedCompany.industry} · {selectedCompany.periode}</div>
            </div>
            <Badge status={selectedCompany.status}/>
            <ScoreRing score={selectedCompany.score} size={52}/>
          </div>
          <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, padding:"0 32px", background:T.navy }}>
            {tabs.map(t=><button key={t} onClick={()=>setDetailTab(t)} style={{ padding:"11px 16px", border:"none", background:"transparent", color:detailTab===t?T.gold:T.muted, borderBottom:detailTab===t?`2px solid ${T.gold}`:"2px solid transparent", cursor:"pointer", fontSize:13, fontFamily:F.body, fontWeight:detailTab===t?600:400 }}>{tabLabel[t]}</button>)}
          </div>
          <div style={{ padding:"24px 32px", flex:1, overflowY:"auto" }}>
            {detailTab==="overview" && (
              <div>
                <div style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:10, padding:18, marginBottom:16 }}>
                  <div style={{ fontSize:11, color:T.gold, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8, fontFamily:F.body }}>Ringkasan Eksekutif</div>
                  <p style={{ fontSize:14, lineHeight:1.7, color:T.cream2, fontFamily:F.body, margin:0 }}>{selectedCompany.ringkasan}</p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                  {[["investasi","💹","Keputusan Investasi"],["pendanaan","🏦","Keputusan Pendanaan"],["dividen","💰","Kebijakan Dividen"]].map(([k,ic,l])=>(
                    <div key={k} style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:9, padding:14 }}>
                      <div style={{ fontSize:11, color:T.muted, fontFamily:F.body, marginBottom:5 }}>{ic} {l}</div>
                      <div style={{ fontSize:12, color:T.cream2, fontFamily:F.body, lineHeight:1.6 }}>{selectedCompany.keputusan[k]}</div>
                    </div>
                  ))}
                  <div style={{ background:`${T.gold}12`, border:`1px solid ${T.gold}44`, borderRadius:9, padding:14 }}>
                    <div style={{ fontSize:11, color:T.gold, fontFamily:F.body, fontWeight:700, marginBottom:5, textTransform:"uppercase", letterSpacing:0.5 }}>🔑 Prioritas Utama</div>
                    <div style={{ fontSize:12, color:T.cream, fontFamily:F.body, lineHeight:1.6, fontWeight:600 }}>{selectedCompany.keputusan.prioritas}</div>
                  </div>
                </div>
                <div style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:10, padding:18 }}>
                  <div style={{ fontSize:11, color:T.gold, textTransform:"uppercase", letterSpacing:0.8, marginBottom:10, fontFamily:F.body }}>🚨 Early Warning System</div>
                  {selectedCompany.warnings.map((w,i)=>{
                    const cfg={ MERAH:{bg:T.red+"18",border:T.red,icon:"⛔",label:"KRITIS"}, KUNING:{bg:T.amber+"18",border:T.amber,icon:"⚠️",label:"WASPADA"}, HIJAU:{bg:T.green+"18",border:T.green,icon:"✅",label:"AMAN"} };
                    const c=cfg[w.level];
                    return <div key={i} style={{ background:c.bg, border:`1px solid ${c.border}44`, borderRadius:8, padding:"10px 14px", marginBottom:8, display:"flex", gap:10 }}>
                      <span>{c.icon}</span>
                      <div><div style={{ fontSize:11, fontWeight:700, color:c.border, fontFamily:F.body, marginBottom:3 }}>{c.label} — {w.cat}</div><div style={{ fontSize:12, color:T.cream2, fontFamily:F.body }}>{w.msg}</div></div>
                    </div>;
                  })}
                </div>
              </div>
            )}
            {detailTab==="rasio" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { title:"💧 Likuiditas", items:[["Current Ratio",selectedCompany.rasio.current+"x",selectedCompany.rasio.current>=1.5],["Quick Ratio","1.8x",true],["Cash Ratio","0.9x",true]] },
                  { title:"🏦 Solvabilitas", items:[["Debt/Equity",selectedCompany.rasio.der+"x",selectedCompany.rasio.der<=1],["Debt/Assets","0.44x",true],["Interest Coverage","6.2x",true]] },
                  { title:"📈 Profitabilitas", items:[["Net Margin",selectedCompany.rasio.npm+"%",selectedCompany.rasio.npm>=8],["ROE",selectedCompany.rasio.roe+"%",selectedCompany.rasio.roe>=15],["EBITDA",selectedCompany.rasio.ebitda+"%",selectedCompany.rasio.ebitda>=15]] },
                  { title:"💵 Cash Flow", items:[["OCF/Revenue",selectedCompany.rasio.ocf+"%",selectedCompany.rasio.ocf>=10],["Free Cash Flow","Rp 4.2M",true],["CapEx Ratio","8%",true]] },
                  { title:"🔧 Efisiensi Operasional", items:[["Cost/Revenue",selectedCompany.rasio.cost_rev+"%",selectedCompany.rasio.cost_rev<=70],["OpEx Ratio","18%",true],["Working Capital","1.8x",true]] },
                  { title:"📦 Aktivitas Tambahan", items:[["Inventory Turnover","8.2x",true],["Accounts Payable Turnover","6.4x",true],["OCF Ratio","1.3x",true]] },
                ].map(s=>(
                  <div key={s.title} style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T.cream, fontFamily:F.body, marginBottom:10 }}>{s.title}</div>
                    {s.items.map(([l,v,good])=>(
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                        <span style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>{l}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:good?T.green:T.red, fontFamily:F.mono }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {detailTab==="benchmark" && <BenchmarkView company={selectedCompany}/>}
            {detailTab==="pdf" && (
              <div style={{ maxWidth:500, margin:"0 auto", textAlign:"center", padding:"40px 20px" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📄</div>
                <h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Export Laporan PDF</h2>
                <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7, margin:"0 0 28px" }}>Download laporan analisis lengkap {selectedCompany.name} siap dikirim ke bank atau investor.</p>
                <div style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:24, textAlign:"left" }}>
                  <div style={{ fontSize:12, color:T.gold, fontFamily:F.body, fontWeight:700, marginBottom:10 }}>Isi laporan:</div>
                  {["Ringkasan eksekutif","Semua rasio keuangan (30+)","Analisis cash flow","Early warning system","Rekomendasi keputusan bisnis","Skor kesehatan 0-100"].map(i=>(
                    <div key={i} style={{ fontSize:12, color:T.cream2, fontFamily:F.body, marginBottom:6 }}>✓ {i}</div>
                  ))}
                </div>
                <button onClick={()=>exportPDF(selectedCompany)} style={{ width:"100%", padding:14, borderRadius:10, border:"none", background:`linear-gradient(135deg,${T.gold},${T.gold2})`, color:T.navy, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:F.body }}>
                  ⬇️ Download Laporan Sekarang
                </button>
                <p style={{ fontSize:11, color:T.muted, fontFamily:F.body, marginTop:10 }}>Format .txt (PDF penuh tersedia di versi production)</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.navy, display:"flex" }}>
  
      <Sidebar active={active} setActive={(n)=>{ setActive(n); setSelectedCompany(null); }} userName={userName} plan={plan}/>
      <div style={{ flex:1, overflowY:"auto" }}>{renderContent()}</div>
      <div style={{ position:"fixed", bottom:20, right:20, background:T.navy2, border:`1px solid ${T.gold}44`, borderRadius:12, padding:"12px 18px", maxWidth:260 }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.gold, fontFamily:F.body, marginBottom:3 }}>⏳ Trial: 5 hari tersisa</div>
        <div style={{ fontSize:11, color:T.muted, fontFamily:F.body, marginBottom:8 }}>Upgrade untuk akses penuh semua fitur.</div>
        <button onClick={()=>setActive("Paket")} style={{ width:"100%", padding:7, borderRadius:7, border:"none", background:`linear-gradient(135deg,${T.gold},${T.gold2})`, color:T.navy, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:F.body }}>Lihat Paket →</button>
      </div>
    </div>
  );
};

// ── ROOT ───────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [userData, setUserData] = useState({ nama:"", email:"", otp:"" });
  const [plan, setPlan] = useState("trial");

  return (
    <>
      {screen==="landing"   && <Landing onDaftar={()=>setScreen("step-email")} onMasuk={()=>setScreen("login")}/>}
      {screen==="step-email"&& <StepEmail onNext={(nama,email,otp)=>{ setUserData({nama,email,otp}); setScreen("step-otp"); }}/>}
      {screen==="step-otp"  && <StepOTP email={userData.email} otpCode={userData.otp} onNext={()=>setScreen("step-password")} onBack={()=>setScreen("step-email")}/>}
      {screen==="step-password"&&<StepPassword nama={userData.nama} onDone={()=>{ setPlan("trial"); setScreen("dashboard"); }}/>}
      {screen==="pricing"   && <PricingPage onBack={()=>setScreen("dashboard")} onPilih={(p)=>{ setPlan(p); setScreen("dashboard"); }}/>}
      {screen==="login"     && <Login onMasuk={()=>setScreen("dashboard")} onDaftar={()=>setScreen("step-email")} onForgot={()=>setScreen("forgot")}/>}
      {screen==="forgot"    && <ForgotPassword onBack={()=>setScreen("login")}/>}
      {screen==="dashboard" && <Dashboard userName={userData.nama||"Budi Santoso"} plan={plan} onUpgrade={(p)=>setPlan(p)}/>}
    </>
  );
}
