import { useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiEye,
  FiLock,
  FiMail,
  FiShield,
  FiUsers,
} from 'react-icons/fi'
import { FaUniversity } from 'react-icons/fa'
import logo from '../../assets/logo.png'

const stats = [
  {
    value: '100+',
    label: 'Schools',
    icon: FaUniversity,
    color: 'from-[#7A37F4] to-[#5D2AE5]',
  },
  {
    value: '500K+',
    label: 'Students',
    icon: FiUsers,
    color: 'from-[#3B73FF] to-[#2453DB]',
  },
  {
    value: '99.9%',
    label: 'Uptime',
    icon: FiShield,
    color: 'from-[#62D095] to-[#45AF76]',
  },
]

function DotGrid({ className }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bg-[radial-gradient(circle,rgba(111,70,255,0.66)_2.5px,transparent_2.7px)] [background-size:24px_24px] ${className}`}
    />
  )
}

function BlurCircle({ className }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full bg-[#623BFF]/30 blur-[1px] ${className}`}
    />
  )
}

function StatCard({ stat }) {
  const Icon = stat.icon

  return (
    <article className="h-[210px] rounded-[22px] border border-[#474778] bg-white/[0.035] px-[22px] pt-[20px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_0_24px_rgba(89,66,210,0.08)]">
      <div
        className={`mb-[48px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br ${stat.color} text-white shadow-[0_10px_28px_rgba(88,58,237,0.27)]`}
      >
        <Icon className="h-[25px] w-[25px]" aria-hidden="true" />
      </div>
      <strong className="block text-[43px] font-black leading-none tracking-[0] text-white">
        {stat.value}
      </strong>
      <span className="mt-[12px] block text-[25px] font-semibold leading-none text-[#D7D9EC]">
        {stat.label}
      </span>
    </article>
  )
}

function ResponsibilityCard() {
  return (
    <article className="mt-[28px] flex h-[125px] items-center gap-[30px] rounded-[18px] border border-[#704BFF] bg-[#4B31DB]/15 px-[32px] shadow-[0_0_22px_rgba(112,75,255,0.18)]">
      <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7542F3] to-[#5A2ADE] text-white shadow-[0_12px_25px_rgba(89,46,220,0.35)]">
        <FiShield className="h-[27px] w-[27px]" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-[27px] font-extrabold leading-tight tracking-[0] text-white">
          Your Campus, Our Responsibility
        </h2>
        <p className="mt-[13px] text-[22px] font-medium leading-tight text-[#E4E4F2]">
          Building smarter institutions for tomorrow.
        </p>
      </div>
    </article>
  )
}

function TextField({ id, label, type, placeholder, icon: Icon, trailing }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-[13px] block text-[18px] font-extrabold leading-none text-[#0E1539]">
        {label}
      </span>
      <span className="flex h-[65px] items-center rounded-[16px] border border-[#DDE2EE] bg-white px-[22px] shadow-[0_0_0_1px_rgba(19,30,63,0.015)] focus-within:border-[#7145FF] focus-within:ring-4 focus-within:ring-[#7145FF]/10">
        <Icon className="mr-[20px] h-[25px] w-[25px] shrink-0 text-[#828BA9]" aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent text-[22px] font-medium leading-none text-[#5F6886] outline-none placeholder:text-[#5F6886]"
        />
        {trailing}
      </span>
    </label>
  )
}

function LoginCard({ onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[820px] rounded-[42px] bg-[#FAFAFD] px-[76px] pb-[38px] pt-[54px] shadow-[0_30px_80px_rgba(0,0,0,0.24)]"
    >
      <header>
        <h2 className="text-[48px] font-black leading-none tracking-[0] text-[#0B1238]">
          Welcome back
        </h2>
        <p className="mt-[19px] text-[25px] font-medium leading-none text-[#858BA9]">
          Sign in to your account to continue
        </p>
      </header>

      <div className="mt-[48px] space-y-[31px]">
        <TextField
          id="email"
          label="Email Address"
          type="email"
          icon={FiMail}
          placeholder="admin@school.com"
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          icon={FiLock}
          placeholder="••••••••"
          trailing={
            <button type="button" aria-label="Show password" className="ml-[18px] text-[#828BA9]">
              <FiEye className="h-[25px] w-[25px]" aria-hidden="true" />
            </button>
          }
        />
      </div>

      <div className="mt-[29px] flex items-center justify-between text-[20px] font-medium leading-none">
        <label className="flex items-center gap-[13px] text-[#858BA9]">
          <input
            type="checkbox"
            defaultChecked
            className="h-[24px] w-[24px] rounded-[4px] accent-[#7046F5]"
          />
          <span>Remember me</span>
        </label>
        <a href="#forgot-password" className="font-semibold text-[#633DFF]">
          Forgot Password?
        </a>
      </div>

      <button
        type="submit"
        className="mt-[29px] flex h-[66px] w-full items-center justify-center gap-[18px] rounded-[14px] bg-gradient-to-r from-[#7935F3] to-[#315FF0] text-[23px] font-extrabold leading-none text-white shadow-[0_16px_35px_rgba(70,82,240,0.24)]"
      >
        Sign In
        <FiArrowRight className="h-[30px] w-[30px]" aria-hidden="true" />
      </button>

      <div className="my-[34px] flex items-center gap-[25px] text-[18px] font-extrabold text-[#858BA9]">
        <span className="h-px flex-1 bg-[#E4E7F0]" />
        <span>or</span>
        <span className="h-px flex-1 bg-[#E4E7F0]" />
      </div>

      <button
        type="button"
        className="flex h-[66px] w-full items-center justify-center gap-[17px] rounded-[14px] border-2 border-[#7145FF] bg-white text-[22px] font-extrabold leading-none text-[#6242EA]"
      >
        <FiUsers className="h-[25px] w-[25px]" aria-hidden="true" />
        Login as Parent
      </button>

      <footer className="mt-[38px] text-center text-[#858BA9]">
        <p className="flex items-center justify-center gap-[13px] text-[18px] font-semibold leading-none">
          <FiShield className="h-[22px] w-[22px]" aria-hidden="true" />
          Secure login powered by Deecampus ERP
        </p>
        <p className="mt-[22px] text-[18px] font-semibold leading-none">
          © 2026 DeeCampus ERP. All rights reserved.
        </p>
      </footer>
    </form>
  )
}

export default function Login() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/Dashboard')
  }

  return (
    <main className="flex min-h-screen overflow-hidden bg-[#030B3D] font-sans text-white lg:h-screen">
      <section className="relative hidden w-1/2 overflow-hidden bg-[#030B3D] lg:block" aria-label="DEE Campus overview">
        <BlurCircle className="-bottom-[142px] -left-[86px] h-[250px] w-[250px]" />
        <BlurCircle className="-top-[213px] left-[363px] h-[630px] w-[630px] bg-[#4732C6]/28" />
        <DotGrid className="right-[90px] top-[345px] h-[150px] w-[160px]" />
        <DotGrid className="bottom-[17px] left-[228px] h-[255px] w-[760px]" />

        <div className="relative z-10 flex h-full flex-col px-[67px] pb-[80px] pt-[45px] [@media(max-height:850px)]:[zoom:.68] [@media(min-height:851px)]:[zoom:.86] [@media(min-height:1000px)]:[zoom:1]">
          <img src={logo} alt="DEE Campus" className="h-auto w-[285px] object-contain" />

          <div className="mt-[78px] max-w-[760px]">
            <h1 className="text-[48px] font-black leading-[1.13] tracking-[0] text-white xl:text-[52px] 2xl:text-[56px]">
              Empowering Schools.
              <br />
              Transforming{' '}
              <span className="bg-gradient-to-r from-[#7644FF] to-[#5C38E8] bg-clip-text text-transparent">
                Education.
              </span>
            </h1>
            <p className="mt-[30px] max-w-[755px] text-[23px] font-medium leading-[1.45] text-[#D6D7EA]">
              From attendance to academics, our platform helps institutions manage
              students, teachers, fees, examinations, and communication from a
              single dashboard.
            </p>
          </div>

          <div className="mt-[35px] grid grid-cols-3 gap-[28px]">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>

          <ResponsibilityCard />
        </div>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center overflow-y-auto bg-gradient-to-br from-[#060A2E] via-[#0A0B36] to-[#301A8B] px-5 py-8 lg:h-screen lg:w-1/2 lg:overflow-hidden lg:px-[52px] lg:py-0">
        <div className="w-full max-w-[820px] [@media(max-height:850px)]:[zoom:.72] [@media(min-height:851px)]:[zoom:.88] [@media(min-height:1000px)]:[zoom:1]">
          <LoginCard onSubmit={handleSubmit} />
        </div>
      </section>
    </main>
  )
}
