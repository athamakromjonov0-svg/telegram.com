import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const DashboardPage = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState(1)
  const [typedMessage, setTypedMessage] = useState('')
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [isTypingStatus, setIsTypingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'personal', 'groups', 'channels'

  // Telegram uchun mukammal va realistik xabarlar bazasi (State)
  const [mockChats, setMockChats] = useState([
    { 
      id: 1, 
      name: 'Telegram Service', 
      msg: 'Siz yangi qurilmadan tizimga kirdingiz. Agar bu siz bo‘lmasangiz, faol seanslarni tekshiring.', 
      time: '18:24', 
      unread: 1, 
      isVerified: true, 
      avatar: null,
      type: 'system',
      subtext: 'service notifications',
      bio: 'Telegram official notification service center for active web sessions.',
      username: '@telegram',
      messages: [
        { id: 101, sender: 'them', text: 'Assalomu alaykum! Telegram Web tizimiga xush kelibsiz.', time: '18:22' },
        { id: 102, sender: 'them', text: 'Siz yangi qurilmadan tizimga kirdingiz. Qurilma: Web Browser v2026. Joylashuv: Toshkent, O‘zbekiston.', time: '18:23' },
        { id: 103, sender: 'them', text: 'Agar bu amalni siz bajarmagan bo‘lsangiz, xavfsizlik yuzasidan zudlik bilan ushbu darchadagi "Tizimdan chiqish" tugmasini bosing.', time: '18:24' }
      ]
    },
    { 
      id: 2, 
      name: 'A Shop Support', 
      msg: 'Buyurtmangiz muvaffaqiyatli qabul qilindi! Tez orada kuryer bog‘lanadi.', 
      time: '14:02', 
      unread: 0, 
      isVerified: false, 
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      type: 'personal',
      subtext: 'online',
      bio: 'A Shop rasmiy qo‘llab-quvvatlash markazi. Savollar bo‘yicha yozing.',
      username: '@ashop_support',
      messages: [
        { id: 201, sender: 'them', text: 'Assalomu alaykum! A Shop platformasiga xush kelibsiz. Sizga qanday yordam bera olaman?', time: '13:58' },
        { id: 202, sender: 'me', text: 'Salom, buyurtma bergan edim, holatini tekshirib bera olasizmi?', time: '14:00' },
        { id: 203, sender: 'them', text: 'Albatta! Buyurtmangiz muvaffaqiyatli qabul qilindi va kuryerga topshirildi! Tez orada siz bilan bog‘lanadi.', time: '14:02' }
      ]
    },
    { 
      id: 3, 
      name: 'Mars Space Academic', 
      msg: 'Loyihani ko‘rib chiqish va dizaynni tuzatish bo‘yicha topshiriqlar yuklandi.', 
      time: 'Kecha', 
      unread: 3, 
      isVerified: true, 
      avatar: null,
      type: 'groups',
      subtext: '45 a‘zo, 12 online',
      bio: 'Mars Space o‘quvchilari va mentorlari uchun yagona amaliy guruh.',
      username: '@mars_space_academic',
      messages: [
        { id: 301, sender: 'them', text: 'Ertaga soat 10:00 da barcha guruhlar uchun yakuniy React imtihoni boshlanadi.', time: 'Kecha 10:15' },
        { id: 302, sender: 'me', text: 'Vazifalarni GitHub-ga yuklab havola qoldirsak bo‘ladimi?', time: 'Kecha 11:30' },
        { id: 303, sender: 'them', text: 'Ha, albatta. Loyihani ko‘rib chiqish va dizaynni tuzatish bo‘yicha topshiriqlar yuklandi. Hamma o‘z vaqtida topshirsin.', time: 'Kecha 15:40' }
      ]
    },
    { 
      id: 4, 
      name: 'Dasturchilar Guruhi', 
      msg: 'Behruz: Firebase login tizimi to‘liq ishladi, Tailwind dizayni ham tayyor.', 
      time: 'Kecha', 
      unread: 0, 
      isVerified: false, 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      type: 'groups',
      subtext: '542 ta a‘zo',
      bio: 'Fullstack va Frontend dasturchilarning o‘zaro fikr almashish hamjamiyati.',
      username: '@uzb_dasturchilar',
      messages: [
        { id: 401, sender: 'them', text: 'Kim Firebase Auth-ni React-ga integratsiya qila oldi? Kimda xatolik bor?', time: 'Kecha 19:40' },
        { id: 402, sender: 'them', text: 'Diyorbek: Men Context API orqali ulab ko‘rdim, lekin ba‘zi joyda hook xatosi berdi.', time: 'Kecha 20:01' },
        { id: 403, sender: 'them', text: 'Behruz: Firebase login tizimi to‘liq ishladi, Tailwind dizayni ham tayyor. Hook xatolarini to‘g‘riladim.', time: 'Kecha 20:15' }
      ]
    },
    { 
      id: 5, 
      name: 'Uzum Market Promo', 
      msg: 'Yozgi chegirmalar 30-iyungacha davom etadi! Shoshiling, mahsulotlar soni cheklangan.', 
      time: '20-Iyun', 
      unread: 0, 
      isVerified: true, 
      avatar: null,
      type: 'channels',
      subtext: '124K obunachilar',
      bio: 'Uzum Market - Milliy marketpleysdagi eng qaynoq chegirmalar va promo-kodlar kanali.',
      username: '@uzum_promo',
      messages: [
        { id: 501, sender: 'them', text: 'Yozgi jazirama kunlar munosabati bilan barcha maishiy texnikalarga muddatli to‘lov foizsiz 12 oyga beriladi!', time: '19-Iyun 09:00' },
        { id: 502, sender: 'them', text: 'Yozgi chegirmalar 30-iyungacha davom etadi! Shoshiling, mahsulotlar soni cheklangan.', time: '20-Iyun 12:45' }
      ]
    }
  ])

  // Foydalanuvchi seansini kuzatish
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        navigate('/') 
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // Tizimdan chiqish funksiyasi
  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error.message)
    }
  }

  // Xabar yuborilganda state-ni yangilash mantiqi
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!typedMessage.trim()) return

    const now = new Date()
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')

    setMockChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === selectedChatId) {
          const newMsg = {
            id: Date.now(),
            sender: 'me',
            text: typedMessage,
            time: timeString
          }
          return {
            ...chat,
            msg: typedMessage,
            time: timeString,
            messages: [...chat.messages, newMsg]
          }
        }
        return chat
      })
    )
    setTypedMessage('')
    
    // Javob qaytarish effektini simulyatsiya qilish
    setIsTypingStatus(true)
    setTimeout(() => {
      setIsTypingStatus(false)
    }, 1500)
  }

  // Xabarni o'chirish funksiyasi (Kengaytirilgan xususiyat)
  const handleDeleteMessage = (chatId, msgId) => {
    setMockChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const filteredMsgs = chat.messages.filter(m => m.id !== msgId)
          const lastMsg = filteredMsgs[filteredMsgs.length - 1]?.text || 'Xabarlar mavjud emas'
          return {
            ...chat,
            msg: lastMsg,
            messages: filteredMsgs
          }
        }
        return chat
      })
    )
  }

  // Qidiruv tizimi (Search Box filtrlash)
  const searchFilteredChats = mockChats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          chat.msg.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    return matchesSearch && chat.type === activeTab
  })

  // Tanlangan faol chat ma'lumotlari
  const currentActiveChat = mockChats.find(c => c.id === selectedChatId) || mockChats[0]

  // Hooklar qoidasiga to'liq amal qilish uchun shart eng pastga qo'yildi
  if (!currentUser) return null

  return (
    <div className="h-screen w-screen flex bg-[#f4f4f5] font-sans antialiased overflow-hidden select-none">
      
      {/* ================== LEFT SIDEBAR PANEL ================== */}
      <div className="w-full md:w-[420px] h-full bg-white border-r border-slate-200 flex flex-col relative z-20 flex-shrink-0">
        
        {/* Sidebar Header qismi */}
        <div className="p-4 flex flex-col gap-3 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 relative">
              <button 
                onClick={() => setActiveMenu(!activeMenu)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all active:scale-95 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-xl font-bold text-slate-800 tracking-tight">Telegram</span>
            </div>

            {/* Foydalanuvchi qisqa profili */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowProfileSettings(!showProfileSettings)}>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                  {currentUser.displayName || 'Telegram Foydalanuvchi'}
                </div>
                <div className="text-[10px] text-emerald-500 font-medium flex items-center justify-end gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> online
                </div>
              </div>
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="User avatar" className="w-9 h-9 rounded-full ring-2 ring-slate-100 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#24A1DE] text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
            </div>
          </div>

          {/* HAQIQIY HARFMA-HARF ISHLOVCHI QIDIRUV SUTUNI */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Suhbatlar va xabarlarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-[#f1f5f9] border border-transparent rounded-xl pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#24A1DE] focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Telegram Toifalar Navigatsiyasi (Tabs) */}
        <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 overflow-x-auto">
          <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'all' ? 'bg-[#24A1DE] text-white' : 'hover:bg-slate-200'}`}>Barchasi</button>
          <button onClick={() => setActiveTab('personal')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'personal' ? 'bg-[#24A1DE] text-white' : 'hover:bg-slate-200'}`}>Shaxsiy</button>
          <button onClick={() => setActiveTab('groups')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'groups' ? 'bg-[#24A1DE] text-white' : 'hover:bg-slate-200'}`}>Guruhlar</button>
          <button onClick={() => setActiveTab('channels')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'channels' ? 'bg-[#24A1DE] text-white' : 'hover:bg-slate-200'}`}>Kanallar</button>
        </div>

        {/* Chatlar ro'yxatini dynamic chiqarish (Oqim) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar bg-white">
          {searchFilteredChats.length > 0 ? (
            searchFilteredChats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => {
                  setSelectedChatId(chat.id)
                  setShowProfileSettings(false)
                }}
                className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-all border-l-4 ${
                  chat.id === selectedChatId 
                    ? 'bg-[#e4f2fe] border-[#24A1DE]' 
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                {chat.avatar ? (
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm" />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 ${
                    chat.id === 1 ? 'bg-gradient-to-tr from-blue-400 to-[#24A1DE]' :
                    chat.id === 3 ? 'bg-gradient-to-tr from-purple-400 to-indigo-500' : 'bg-gradient-to-tr from-orange-400 to-amber-500'
                  }`}>
                    {chat.name[0]}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <h3 className={`text-sm truncate max-w-[150px] ${chat.id === selectedChatId ? 'font-bold text-[#1d84ba]' : 'font-semibold text-slate-800'}`}>{chat.name}</h3>
                      {chat.isVerified && (
                        <svg className="w-4 h-4 text-[#24A1DE] fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-normal flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className={`text-xs truncate pr-2 ${chat.id === selectedChatId ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{chat.msg}</p>
                </div>

                {chat.unread > 0 && chat.id !== selectedChatId && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#24A1DE] text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-sm">
                    {chat.unread}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Suhbatlar topilmadi
            </div>
          )}
        </div>

        {/* Burger bosilganda menyu darchasi */}
        {activeMenu && (
          <div className="absolute top-14 left-4 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-fade-in">
            <div className="px-4 py-2 border-b border-slate-100 mb-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tizim boshqaruvi</p>
            </div>
            <button onClick={() => { setShowProfileSettings(true); setActiveMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Mening profilim
            </button>
            <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 font-medium">
              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Tizimdan chiqish
            </button>
          </div>
        )}
        {activeMenu && <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(false)}></div>}
      </div>

      {/* ================== RIGHT MAIN VIEW (DASHBOARD) ================== */}
      <div 
        className="hidden md:flex flex-1 h-full flex-col relative bg-[#f4ebd9]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundBlendMode: 'overlay',
          opacity: '0.96'
        }}
      >
        {/* Yuqori faol chat Header qismi */}
        <div className="h-16 w-full bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            {currentActiveChat.avatar ? (
              <img src={currentActiveChat.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#24A1DE] flex items-center justify-center text-white font-bold text-sm">
                {currentActiveChat.name[0]}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                {currentActiveChat.name}
                {currentActiveChat.isVerified && (
                  <svg className="w-3.5 h-3.5 text-[#24A1DE] fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                {isTypingStatus && currentActiveChat.id !== 1 ? 'yozmoqda...' : currentActiveChat.subtext}
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
            Secure Connection
          </div>
        </div>

        {/* SHARTLI PANAROMA: Telegram Service shaxsiy profil boshqaruvi hisoblanadi */}
        {currentActiveChat.id === 1 ? (
          /* ================== BO'LIM 1: TELEGRAM SERVICE (LOGOUT CARD) ================== */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center">
            <div className="w-full max-w-[420px] bg-white border border-slate-200/60 rounded-[32px] p-8 text-center shadow-2xl backdrop-blur-md bg-opacity-95 transform hover:scale-[1.01] transition-all duration-300">
              
              <div className="relative inline-block mb-4">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#2abee3] to-[#229ed9] text-white flex items-center justify-center font-bold text-4xl shadow-md mx-auto">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-6 h-6 bg-[#24A1DE] rounded-full flex items-center justify-center border-2 border-white text-white shadow">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{currentUser.displayName || 'Telegram User'}</h2>
              <span className="text-xs font-semibold text-[#24A1DE] bg-[#24A1DE]/10 px-3 py-1 rounded-full mt-1.5 inline-block">{currentUser.email}</span>

              <div className="border-t border-slate-100 my-5"></div>

              <div className="bg-blue-50/70 border border-blue-100/50 rounded-2xl p-4 text-left mb-4">
                <span className="text-[11px] font-bold text-[#24A1DE] uppercase tracking-wider block mb-1">Xizmat bildirishnomasi:</span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Siz ushbu tizimga Google xavfsiz autentifikatsiya tizimi orqali kirdingiz. Loyihani yakunlash yoki boshqa hisobga o‘tish uchun quyidagi tugmani ishlating.
                </p>
              </div>

              <div className="text-left bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500 space-y-2">
                <div className="flex justify-between"><span>User ID:</span><span className="font-mono text-slate-700">{currentUser.uid.substring(0, 14)}...</span></div>
                <div className="flex justify-between"><span>Shifrlash turi:</span><span className="font-medium text-emerald-600">SSL / MTProto Active</span></div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full h-12 bg-rose-50 border border-rose-200/60 hover:bg-rose-100 text-rose-600 font-bold text-sm tracking-wide rounded-xl mt-5 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Tizimdan chiqish (Sign Out)
              </button>
            </div>
          </div>
        ) : (
          /* ================== BO'LIM 2: ODDIY TELEGRAM CHAT KO'RINISHI ================== */
          <div className="flex-1 flex flex-row overflow-hidden relative">
            
            {/* Markaziy chat oynasi */}
            <div className="flex-1 flex flex-col justify-between h-full bg-transparent overflow-hidden">
              
              {/* Xabarlar tarixi oqimi */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3.5 custom-scrollbar">
                <div className="mx-auto bg-slate-800/30 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                  Bugun
                </div>

                {currentActiveChat.messages.length > 0 ? (
                  currentActiveChat.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex flex-col max-w-[65%] rounded-[20px] px-4 py-2.5 text-sm shadow-sm relative group transition-all ${
                        message.sender === 'me' 
                          ? 'bg-[#e2f7cb] text-slate-800 rounded-tr-none self-end' 
                          : 'bg-white text-slate-800 rounded-tl-none self-start'
                      }`}
                    >
                      {/* Xabarni o'chirish tugmasi (Hover bo'lganda chiqadi) */}
                      <button 
                        onClick={() => handleDeleteMessage(currentActiveChat.id, message.id)}
                        className="absolute -top-2 -left-2 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Xabarni o'chirish"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>

                      <p className="leading-relaxed font-normal pr-7 break-words">{message.text}</p>
                      <span className="text-[9px] text-slate-400 absolute bottom-1 right-2.5 font-mono">
                        {message.time} {message.sender === 'me' && '✓✓'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="my-auto mx-auto text-slate-400 text-xs bg-white/80 px-4 py-2 rounded-xl border">Xabarlar tarixi bo‘sh</div>
                )}

                {/* Yozilmoqda effekti */}
                {isTypingStatus && (
                  <div className="bg-white text-slate-500 rounded-[20px] rounded-tl-none px-4 py-2.5 text-xs shadow-sm self-start flex items-center gap-1 font-medium">
                    <span>{currentActiveChat.name} xabar yozmoqda</span>
                    <span className="animate-bounce">.</span><span className="animate-bounce [animation-delay:0.2s]">.</span><span className="animate-bounce [animation-delay:0.4s]">.</span>
                  </div>
                )}
              </div>

              {/* Pastki xabar yuborish formasi */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-all active:scale-90">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                
                <input 
                  type="text"
                  placeholder="Xabarni kiriting..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 h-11 bg-[#f1f5f9] border border-transparent rounded-xl px-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#24A1DE] focus:outline-none transition-all"
                />

                <button 
                  type="submit" 
                  disabled={!typedMessage.trim()} 
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    typedMessage.trim() ? 'bg-[#24A1DE] text-white hover:bg-[#1e92cb] shadow-md' : 'text-slate-300 bg-transparent cursor-default'
                  }`}
                >
                  <svg className="w-5 h-5 transform rotate-45" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
              </form>
            </div>

            {/* O'ng tarafdagi user ma'lumotlari paneli (Right Info Panel) */}
            <div className="w-64 h-full bg-white border-l border-slate-200 hidden lg:flex flex-col p-4 text-center">
              <div className="w-20 h-20 bg-[#24A1DE] text-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                {currentActiveChat.avatar ? <img src={currentActiveChat.avatar} className="w-full h-full rounded-full object-cover" /> : currentActiveChat.name[0]}
              </div>
              <h4 className="text-sm font-bold text-slate-800">{currentActiveChat.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium">{currentActiveChat.username}</p>
              
              <div className="border-t border-slate-100 my-4"></div>
              
              <div className="text-left space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ma‘lumot (Bio)</span>
                  <span className="text-xs text-slate-600 leading-normal font-normal block mt-0.5">{currentActiveChat.bio}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Turi</span>
                  <span className="text-xs text-[#24A1DE] font-semibold capitalize bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">{currentActiveChat.type}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Eng pastki info bar */}
        <div className="h-9 w-full bg-white/90 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Sessiya: {currentUser.uid.substring(0, 10)}...</span>
          <span>A Telegram-Web K2 Build v3.0.0</span>
        </div>
      </div>

      {/* Profil sozlamalari modal oynasi (Kengaytirilgan block) */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl animate-fade-in relative">
            <button onClick={() => setShowProfileSettings(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-base font-bold text-slate-800 mb-4">Profil Ma‘lumotlari</h3>
            <div className="flex flex-col items-center gap-2 text-center">
              {currentUser.photoURL ? <img src={currentUser.photoURL} className="w-16 h-16 rounded-full object-cover shadow" /> : <div className="w-16 h-16 bg-[#24A1DE] text-white text-xl font-bold rounded-full flex items-center justify-center">{currentUser.displayName ? currentUser.displayName[0] : 'U'}</div>}
              <div className="text-sm font-bold text-slate-800">{currentUser.displayName || 'Telegram User'}</div>
              <div className="text-xs text-slate-400 font-mono">{currentUser.email}</div>
            </div>
            <button onClick={handleLogout} className="w-full h-10 bg-rose-600 text-white font-semibold text-xs rounded-xl mt-6 hover:bg-rose-700 transition-all">Tizimdan chiqish</button>
          </div>
        </div>
      )}

      {/* Skroll panel uchun CSS style block */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

    </div>
  )
}

export default DashboardPage