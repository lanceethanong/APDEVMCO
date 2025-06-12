import { Link } from 'react-router-dom'

const Register= () => {
    return(
        <div>
            <h1 className="p-15 font-[JejuGothic] text-5xl text-center">REGISTER</h1>
            <div className="bg-black/[var(--bg-opacity)] [--bg-opacity:50%] p-15 shadow-lg relative w-[562px] h-[375px]">
                <form className="mb-4" action="">
                    <div>
                        <label className="font-[JejuGothic]" htmlFor="">DLSU Email</label><br/>
                        <input className="bg-gray-300 text-black font-[JejuGothic]" type="email" required/>
                    </div>
                    <div>
                        <label className="font-[JejuGothic]" htmlFor="">Password</label><br/>
                        <input className="bg-gray-300 text-black font-[JejuGothic]" type="password" required/>
                    </div>
                    <div>
                        <label className="font-[JejuGothic]" htmlFor="">Confirm Password</label><br/>
                        <input className="bg-gray-300 text-black font-[JejuGothic]" type="password" required/>
                    </div>
                    <div>
                        <label className="font-[JejuGothic]" htmlFor="">Role</label><br/>
                        <select className="bg-gray-300 text-black font-[JejuGothic]" required>
                            <option className="bg-gray-400" value="student">Student</option>
                            <option className="bg-gray-400" value="lab_technician">Lab Technician</option>
                        </select>
                    </div>
                    <div className="m-2">
                        <button className="w-full bg-gray-300 text-black p-1 font-bold hover:bg-blue-500 font-[JejuGothic]" type="submit">Register</button> 
                    </div>
                    <span className="inset-x-0 bottom-0 font-[JejuGothic]">Already Signed in? <Link className="text-blue-500" to='/Login'>Login Now</Link></span>
                </form>
            </div>
        </div>
    )
}

export default Register;