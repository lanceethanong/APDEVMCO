import { Link } from 'react-router-dom'

const Login = () => {
    return(
        <div>
            <h1 className="p-15 font-[JejuGothic] text-5xl text-center">LOGIN</h1>
            <div className="bg-black/[var(--bg-opacity)] [--bg-opacity:50%] p-15 shadow-lg relative w-[562px] h-[340px]">
                <form className="relative" action="">
                    <div>
                        <label className="font-[JejuGothic]" htmlFor="">DLSU Email</label><br/>
                        <input className="bg-gray-300 text-black font-[JejuGothic]" type="email"/>
                    </div>
                    <div>
                        <label className="font-[JejuGothic]" htmlFor="">Password</label><br/>
                        <input className="bg-gray-300 text-black font-[JejuGothic]" type="password"/>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <input type="checkbox" name="" id=""/>
                            <label className="font-[JejuGothic]" htmlFor="Remember Me">Remember Me</label>
                        </div>
                    </div>
                    <div className="m-2">
                        <button className="w-full bg-gray-300 text-black p-1 font-bold hover:bg-blue-500 font-[JejuGothic]" type="submit">Login</button> 
                    </div>
                    <span className="inset-x-0 bottom-0 font-[JejuGothic]">New Here? <Link className="text-blue-500" to='/Register'>Create an Account</Link></span>
                </form>
            </div>
        </div>
    )
}

export default Login;