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

const Logo = ({ size=24 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ width:size+8, height:size+8, borderRadius:8, background:`linear-gradient(135deg,${T.gold},${T.gold2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.65 }}>⚖</div>
    <span style={{ fontSize:size, fontWeight:700, fontFamily:F.display, color:T.cream }}>NeyCo</span>
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

const Landing = ({ onDaftar, onMasuk }) => (
  <AuthLayout
    left={<div>
      <h1 style={{ fontSize:32, fontWeight:700, fontFamily:F.display, color:T.cream, lineHeight:1.25, margin:"0 0 14px" }}>Analisis Keuangan Bisnis Anda<br/><span style={{ color:T.gold }}>Otomatis & Akurat</span></h1>
      <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7, margin:"0 0 24px" }}>Upload laporan keuangan. AI kami analisis semua rasio, deteksi risiko, dan kasih rekomendasi strategis untuk bisnis Anda.</p>
      {["📊 30+ rasio keuangan otomatis","💵 Analisis cash flow & arus kas","⚠️ Early warning sebelum masalah terjadi","💬 Tanya AI tentang keuangan bisnis Anda","📄 Laporan PDF"].map(f=>(
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
        <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 20px" }}>Digunakan untuk masuk ke akun NeyCo Anda</p>
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

// ── LOGIN (FIXED - kode PDF yang nyasar sudah dihapus) ─────────
const Login = ({ onMasuk, onDaftar, onForgot }) => {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [show,setShow]=useState(false);
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
          <label style={{ fontSize:11, color:T.muted, fontFamily:F.body, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>Password</label>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} placeholder="Masukkan password" value={pass} onChange={e=>setPass(e.target.value)}
              style={{ width:"100%", background:T.navy3, border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 44px 11px 14px", color:T.cream, fontSize:14, fontFamily:F.body, outline:"none", boxSizing:"border-box" }}/>
            <button onClick={()=>setShow(!show)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, cursor:"pointer" }}>{show?"🙈":"👁"}</button>
          </div>
        </div>
        <div style={{ textAlign:"right", marginBottom:16 }}>
          <span onClick={onForgot} style={{ fontSize:12, color:T.gold, cursor:"pointer", fontFamily:F.body }}>Lupa password?</span>
        </div>
        <Btn onClick={onMasuk}>Masuk →</Btn>
        <div style={{ textAlign:"center", marginTop:16 }}>
          <span style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>Belum punya akun? </span>
          <span onClick={onDaftar} style={{ fontSize:12, color:T.gold, cursor:"pointer", fontFamily:F.body, fontWeight:600 }}>Daftar gratis</span>
        </div>
      </div>}
    />
  );
};

const ForgotPassword = ({ onBack }) => {
  const [email,setEmail]=useState(""); const [sent,setSent]=useState(false);
  return (
    <AuthLayout
      left={<div>
        <div style={{ fontSize:38, marginBottom:16 }}>🔓</div>
        <h2 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Reset Password</h2>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, lineHeight:1.7 }}>Masukkan email Anda dan kami akan kirimkan link untuk reset password.</p>
      </div>}
      right={<div>
        <h2 style={{ fontSize:20, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 4px" }}>Lupa Password?</h2>
        <p style={{ fontSize:13, color:T.muted, fontFamily:F.body, margin:"0 0 20px" }}>Kami kirim link reset ke email Anda</p>
        {!sent ? <>
          <Inp label="Email" type="email" placeholder="budi@perusahaan.com" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/>
          <Btn onClick={()=>setSent(true)}>Kirim Link Reset →</Btn>
        </> : <div style={{ background:`${T.green}18`, border:`1px solid ${T.green}44`, borderRadius:10, padding:18, textAlign:"center" }}>
          <div style={{ fontSize:24, marginBottom:8 }}>✅</div>
          <div style={{ fontSize:14, color:T.green, fontFamily:F.body, fontWeight:700 }}>Link reset dikirim!</div>
          <div style={{ fontSize:12, color:T.muted, fontFamily:F.body, marginTop:6 }}>Cek inbox email {email}</div>
        </div>}
        <button onClick={onBack} style={{ width:"100%", marginTop:14, padding:10, borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:F.body }}>← Kembali ke Login</button>
      </div>}
    />
  );
};

const PricingPage = ({ onBack, onPilih }) => (
  <div style={{ minHeight:"100vh", background:T.navy, padding:"40px 24px" }}>
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
        <Logo/>
        <button onClick={onBack} style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:F.body }}>← Kembali</button>
      </div>
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <h1 style={{ fontSize:32, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 10px" }}>Pilih Paket Anda</h1>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body }}>Mulai gratis, upgrade kapan saja</p>
      </div>
      <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { id:"trial", name:"Trial", price:"Gratis", period:"5 hari", color:T.muted, features:["3 perusahaan","Analisis dasar","Export terbatas"] },
          { id:"plan-a", name:"Plan A", price:"Rp 329rb", period:"/bulan", color:T.gold, features:["10 perusahaan","Semua rasio keuangan","Export PDF penuh","AI Chat"] },
          { id:"plan-b", name:"Plan B", price:"Rp 612rb", period:"/bulan", color:T.green, features:["Unlimited perusahaan","Semua fitur Plan A","Benchmark industri","Priority support"] },
        ].map(p=>(
          <div key={p.id} style={{ flex:"1 1 250px", maxWidth:280, background:T.navy2, border:`2px solid ${p.color}44`, borderRadius:16, padding:24 }}>
            <div style={{ fontSize:11, color:p.color, fontFamily:F.body, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>{p.name}</div>
            <div style={{ fontSize:28, fontWeight:700, fontFamily:F.display, color:T.cream }}>{p.price}</div>
            <div style={{ fontSize:12, color:T.muted, fontFamily:F.body, marginBottom:20 }}>{p.period}</div>
            {p.features.map(f=><div key={f} style={{ fontSize:13, color:T.cream2, fontFamily:F.body, marginBottom:8 }}>✓ {f}</div>)}
            <button onClick={()=>onPilih(p.id)} style={{ width:"100%", marginTop:16, padding:11, borderRadius:9, border:"none", background:`linear-gradient(135deg,${p.color},${p.color}CC)`, color:T.navy, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:F.body }}>
              Pilih {p.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Sidebar = ({ active, setActive, userName, plan }) => {
  const menus = ["Dashboard","Perusahaan","Analisis","Early Warning","AI Chat","Export PDF","Paket"];
  const icons = { "Dashboard":"🏠","Perusahaan":"🏢","Analisis":"📊","Early Warning":"⚠️","AI Chat":"💬","Export PDF":"📄","Paket":"💎" };
  return (
    <div style={{ width:200, background:T.navy2, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", padding:"24px 0", minHeight:"100vh" }}>
      <div style={{ padding:"0 20px 24px" }}><Logo size={18}/></div>
      <div style={{ flex:1 }}>
        {menus.map(m=>(
          <div key={m} onClick={()=>setActive(m)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 20px", cursor:"pointer", background:active===m?`${T.gold}18`:"transparent", borderLeft:`3px solid ${active===m?T.gold:"transparent"}`, marginBottom:2 }}>
            <span style={{ fontSize:15 }}>{icons[m]}</span>
            <span style={{ fontSize:13, color:active===m?T.gold:T.muted, fontFamily:F.body, fontWeight:active===m?700:400 }}>{m}</span>
          </div>
        ))}
      </div>
      <div style={{ padding:"16px 20px", borderTop:`1px solid ${T.border}` }}>
        <div style={{ fontSize:12, color:T.cream2, fontFamily:F.body, fontWeight:600, marginBottom:2 }}>{userName||"Pengguna"}</div>
        <div style={{ fontSize:11, color:T.gold, fontFamily:F.body, textTransform:"uppercase" }}>{plan||"Trial"}</div>
      </div>
    </div>
  );
};

const exportPDF = (company) => {
  const content = `LAPORAN KEUANGAN - ${company.name}\n${"=".repeat(40)}\nSkor Kesehatan: ${company.score}/100\nStatus: ${company.status}\n\nRasio Keuangan:\n- Current Ratio: ${company.current}\n- DER: ${company.der}\n- Net Profit Margin: ${company.npm}%\n- ROE: ${company.roe}%\n\nDibuat oleh NeyCo`;
  const blob = new Blob([content], { type:"text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `laporan-${company.name}.txt`; a.click();
  URL.revokeObjectURL(url);
};

const Dashboard = ({ userName, plan, onUpgrade }) => {
  const [active, setActive] = useState("Dashboard");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies] = useState([
    { id:1, name:"PT Maju Bersama", industry:"Manufaktur", score:72, status:"SEHAT", current:2.1, der:0.8, npm:9.2, roe:15.3, ebitda:18.5, cost_rev:68, ocf:14 },
    { id:2, name:"CV Perdana Jaya", industry:"Perdagangan", score:45, status:"WASPADA", current:1.2, der:1.4, npm:4.1, roe:8.7, ebitda:8.2, cost_rev:82, ocf:5 },
    { id:3, name:"PT Digital Nusantara", industry:"Teknologi", score:88, status:"SEHAT", current:3.1, der:0.3, npm:22.5, roe:24.1, ebitda:35.0, cost_rev:48, ocf:28 },
  ]);

  const renderContent = () => {
    if (active === "Dashboard") {
      return (
        <div style={{ padding:32 }}>
          <h1 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 8px" }}>Selamat datang, {userName||"Budi"}! 👋</h1>
          <p style={{ fontSize:14, color:T.muted, fontFamily:F.body, margin:"0 0 28px" }}>Berikut ringkasan portofolio bisnis Anda</p>
          <div style={{ display:"flex", gap:16, marginBottom:28, flexWrap:"wrap" }}>
            {[
              { label:"Total Perusahaan", value:companies.length, icon:"🏢" },
              { label:"Status Sehat", value:companies.filter(c=>c.status==="SEHAT").length, icon:"✅" },
              { label:"Perlu Perhatian", value:companies.filter(c=>c.status!=="SEHAT").length, icon:"⚠️" },
            ].map(s=>(
              <div key={s.label} style={{ flex:"1 1 150px", background:T.navy2, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontSize:28, fontWeight:700, fontFamily:F.mono, color:T.cream }}>{s.value}</div>
                <div style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>{s.label}</div>
              </div>
            ))}
          </div>
          <h2 style={{ fontSize:16, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 16px" }}>Perusahaan Anda</h2>
          {companies.map(c=>(
            <div key={c.id} onClick={()=>{ setSelectedCompany(c); setActive("Analisis"); }}
              style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:12, cursor:"pointer", display:"flex", alignItems:"center", gap:16 }}>
              <ScoreRing score={c.score} size={60}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:T.cream, fontFamily:F.body }}>{c.name}</div>
                <div style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>{c.industry}</div>
              </div>
              <Badge status={c.status}/>
            </div>
          ))}
        </div>
      );
    }

    if (active === "Analisis") {
      if (!selectedCompany) {
        return (
          <div style={{ padding:32 }}>
            <h1 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 20px" }}>Pilih Perusahaan</h1>
            {companies.map(c=>(
              <div key={c.id} onClick={()=>setSelectedCompany(c)}
                style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:12, cursor:"pointer", display:"flex", alignItems:"center", gap:16 }}>
                <ScoreRing score={c.score} size={60}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:T.cream, fontFamily:F.body }}>{c.name}</div>
                  <div style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>{c.industry}</div>
                </div>
                <Badge status={c.status}/>
              </div>
            ))}
          </div>
        );
      }
      const bm = BENCHMARK[selectedCompany.industry]||BENCHMARK["Lainnya"];
      const rasios = [
        { label:"Current Ratio", value:selectedCompany.current, benchmark:bm.current, unit:"x", good: selectedCompany.current >= bm.current },
        { label:"DER", value:selectedCompany.der, benchmark:bm.der, unit:"x", good: selectedCompany.der <= bm.der },
        { label:"Net Profit Margin", value:selectedCompany.npm, benchmark:bm.npm, unit:"%", good: selectedCompany.npm >= bm.npm },
        { label:"ROE", value:selectedCompany.roe, benchmark:bm.roe, unit:"%", good: selectedCompany.roe >= bm.roe },
        { label:"EBITDA Margin", value:selectedCompany.ebitda, benchmark:bm.ebitda, unit:"%", good: selectedCompany.ebitda >= bm.ebitda },
        { label:"Cost/Revenue", value:selectedCompany.cost_rev, benchmark:bm.cost_rev, unit:"%", good: selectedCompany.cost_rev <= bm.cost_rev },
        { label:"OCF Margin", value:selectedCompany.ocf, benchmark:bm.ocf, unit:"%", good: selectedCompany.ocf >= bm.ocf },
      ];
      return (
        <div style={{ padding:32 }}>
          <button onClick={()=>setSelectedCompany(null)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:F.body, marginBottom:20 }}>← Kembali</button>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
            <ScoreRing score={selectedCompany.score} size={80}/>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 4px" }}>{selectedCompany.name}</h1>
              <div style={{ fontSize:13, color:T.muted, fontFamily:F.body, marginBottom:6 }}>{selectedCompany.industry}</div>
              <Badge status={selectedCompany.status}/>
            </div>
          </div>
          <h2 style={{ fontSize:16, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 16px" }}>Rasio Keuangan vs Benchmark</h2>
          {rasios.map(r=>(
            <div key={r.label} style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:10, padding:16, marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:16 }}>{r.good?"✅":"❌"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.cream, fontFamily:F.body }}>{r.label}</div>
                <div style={{ fontSize:11, color:T.muted, fontFamily:F.body }}>Benchmark: {r.benchmark}{r.unit}</div>
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:r.good?T.green:T.red, fontFamily:F.mono }}>{r.value}{r.unit}</div>
            </div>
          ))}
        </div>
      );
    }

    if (active === "Export PDF") {
      if (!selectedCompany) {
        return (
          <div style={{ padding:32 }}>
            <h1 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 20px" }}>Export PDF — Pilih Perusahaan</h1>
            {companies.map(c=>(
              <div key={c.id} onClick={()=>setSelectedCompany(c)}
                style={{ background:T.navy2, border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:12, cursor:"pointer", display:"flex", alignItems:"center", gap:16 }}>
                <ScoreRing score={c.score} size={60}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:T.cream, fontFamily:F.body }}>{c.name}</div>
                  <div style={{ fontSize:12, color:T.muted, fontFamily:F.body }}>{c.industry}</div>
                </div>
                <Badge status={c.status}/>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div style={{ padding:32, maxWidth:500 }}>
          <button onClick={()=>setSelectedCompany(null)} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:F.body, marginBottom:20 }}>← Kembali</button>
          <div style={{ fontSize:38, marginBottom:12 }}>📄</div>
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
      );
    }

    return (
      <div style={{ padding:32 }}>
        <h1 style={{ fontSize:24, fontWeight:700, fontFamily:F.display, color:T.cream, margin:"0 0 16px" }}>{active}</h1>
        <p style={{ fontSize:14, color:T.muted, fontFamily:F.body }}>Fitur ini akan segera hadir.</p>
      </div>
    );
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
      {screen==="landing"      && <Landing onDaftar={()=>setScreen("step-email")} onMasuk={()=>setScreen("login")}/>}
      {screen==="step-email"   && <StepEmail onNext={(nama,email,otp)=>{ setUserData({nama,email,otp}); setScreen("step-otp"); }}/>}
      {screen==="step-otp"     && <StepOTP email={userData.email} otpCode={userData.otp} onNext={()=>setScreen("step-password")} onBack={()=>setScreen("step-email")}/>}
      {screen==="step-password"&& <StepPassword nama={userData.nama} onDone={()=>{ setPlan("trial"); setScreen("dashboard"); }}/>}
      {screen==="pricing"      && <PricingPage onBack={()=>setScreen("dashboard")} onPilih={(p)=>{ setPlan(p); setScreen("dashboard"); }}/>}
      {screen==="login"        && <Login onMasuk={()=>setScreen("dashboard")} onDaftar={()=>setScreen("step-email")} onForgot={()=>setScreen("forgot")}/>}
      {screen==="forgot"       && <ForgotPassword onBack={()=>setScreen("login")}/>}
      {screen==="dashboard"    && <Dashboard userName={userData.nama||"Budi Santoso"} plan={plan} onUpgrade={(p)=>setPlan(p)}/>}
    </>
  );
}
