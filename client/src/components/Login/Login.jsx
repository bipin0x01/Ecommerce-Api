import GoogleIcon from '@mui/icons-material/Google';
import React from "react"
import {useState} from "react"
import { useDispatch } from 'react-redux';
import { login as userLogin } from '../../store/userSlice';
import CloseIcon from '@mui/icons-material/Close';
import {toast, ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import {onStateChange} from "../../util/userState"

function Login(props) {

    const loginFormat={
        username:"",
        password:"",
    }

    const registerFormat={
        fname:"",
        lname:"",
        email:"",
        username:"",
        password:"",
        confirmPassword:""
    }

    const [file,setFile]=useState({})
    const [isRegistered,setIsRegistered]=useState(true)
    const [login,setLogin]=useState(loginFormat)

    const [registerInvalid,setInvalid]=useState(registerFormat)

    const [loginInvalid,setLoginInvalid]=useState(loginFormat)
    const [register,setRegister]=useState(registerFormat)

    const dispatch=useDispatch()
   

    const updateInput=(event,reducer)=>{
        const {name,value}=event.target
        reducer(state=>{
            return {
                ...state,
                [name]:value
            }
        })
    }


    const inputContainer=(data)=>{
        return data.map(form=>{
        return (
                <label className='input-label' id={form.name}>
                    <input
                        key={form.key}
                        name={form.name} 
                        autoComplete="off"  
                        placeholder={form.placeHolder} 
                        onChange={(e)=>{form.callback(e,form.reducer)}} 
                        type={(form.name==="password" || form.name==="confirmPassword")?"password":"text"} 
                        value={form.value} className='form-input'
                        onBlur={(e)=>form.validate(e)}
                        id={form.name}
                        required="required"
                    />
                    <span style={{color:"red"}}>{form.invalidValue[form.name]}</span>
                </label>
        )})
    }

    const sendLogin=(e)=>{
        e.preventDefault()
        const id = toast.loading("Please wait...")
        axios.post(
            "http://localhost:65000/user/auth/login",
            login,
            {
                headers:{'content-type': 'application/json'},
                withCredentials:true
            })
        .then(data=>{
            toast.update(id, {
                render:"Logged in Successfully",
                position: "top-right",
                autoClose: 5000,
                type:"success",
                hideProgressBar: false,
                closeOnClick: true,
                isLoading:false,
                pauseOnHover: true,
                progress: undefined,
            })

            onStateChange((success,err)=>{
                success && dispatch(userLogin(success.data))
            })
            setRegister(registerFormat)
            setLogin(loginFormat)
            setFile({})
        }).catch(err=>{
            toast.update(id, {
                render:err.response.data.message,
                position: "top-right",
                autoClose: 5000,
                type:"error",
                hideProgressBar: false,
                closeOnClick: true,
                isLoading:false,
                pauseOnHover: true,
                progress: undefined,
            });
                
        })

    }

    const sendRegister=(e)=>{
        e.preventDefault()
        const formData=new FormData()
        Object.keys(register).forEach(key=>{
            formData.append(key,register[key])
        })
        formData.append("avatar",file)
        const id = toast.loading("Please wait...")
        axios.post(
            "http://localhost:65000/user/auth/register",
            formData,
            {
                headers:{'content-type': 'multipart/form-data'}
            })
        .then(data=>{
            toast.update(id, {
                render:"User registered successfully",
                position: "top-right",
                autoClose: 5000,
                type:"success",
                hideProgressBar: false,
                isLoading:false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setRegister(registerFormat)
            setLogin(loginFormat)
            setFile({})
            setIsRegistered(true)
            
        }).catch(err=>{
            toast.update(id, {
                render:err.response.data.message,
                position: "top-right",
                autoClose: 5000,
                type:"error",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                isLoading:false,
                draggable: true,
                progress: undefined,
            });
        })
    }

    const validateLogin=(node)=>{
        const {name,value}=node.target
        switch(name){

            case "password":
                if (value===""){
                    setLoginInvalid(prev=>({...prev,[name]:"Password must be 8 character long"}))
                }
                else{
                    setLoginInvalid(prev=>({...prev,[name]:""}))
                }
                break
            case "username":
                if (value==="") {
                    setLoginInvalid(prev=>({...prev,[name]:"Invalid Username"}))
                }
                else{
                    setLoginInvalid(prev=>({...prev,[name]:""}))
                }
        }
    }

    const validateRegister=(node)=>{
        const {name,value}=node.target
        switch(name){
            case "fname":
                value!==""?
                    setInvalid(prev=>({...prev,[name]:""}))
                    :   
                    setInvalid(prev=>({...prev,[name]:"First name is required"}))
                break
            case "lname":
                value!==""? 
                    setInvalid(prev=>({...prev,[name]:""}))
                    :
                    setInvalid(prev=>({...prev,[name]:"Last name is required"}))
                break
            case "username":
                if (value==="" || value < 5) {
                    setInvalid(prev=>({...prev,[name]:"Invalid Username"}))
                }
                else{
                    axios.post(
                        "http://localhost:65000/user/auth/available-username",
                        {username:value},
                        )
                    .then(data=>{
                        Boolean(data.data.message)?setInvalid(prev=>({...prev,[name]:""})):setInvalid(prev=>({...prev,[name]:"Username already taken"}))
        
                    }).catch(err=>{
                        setInvalid(prev=>({...prev,[name]:"Error occured on server please try again..."}))
                    })    
                }
                break

            case "email":
                const re =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (value==="" || !re.test(value.toLowerCase())){
                    setInvalid(prev=>({...prev,[name]:"Invalid email address"}))
                    
                }
                else{
                    setInvalid(prev=>({...prev,[name]:""}))
                }
                break

            case "password":
                if (value==="" || value < 8 ){
                    setInvalid(prev=>({...prev,[name]:"Password must be 8 character long"}))
                }
                else{
                    setInvalid(prev=>({...prev,[name]:""}))
                }
                break

            case "confirmPassword":
                if (value==="" || value < 8 || value!==register.password){
                        setInvalid(prev=>({...prev,[name]:"Password does not match"}))
                }
                else{
                    setInvalid(prev=>({...prev,[name]:""}))
                }
                break
            default:
                break
        }
    }

    
  return (
    <div className='login-container'>
        <div className='login-card'>
            <div className='login-content'>
                <div className='login-header'>
                    <p>{isRegistered?"Login":"Signup"}</p>
                    <button><CloseIcon /></button>
                </div>
                <div className='login-oauth-section' onClick={()=>{window.location.href="http://localhost:65000/user/auth/google"}}>
                    <div className='oauth-container'>
                        <GoogleIcon className='oauth' />
                        <span>{isRegistered?"Login with Google":"Signup with Google"}</span>
                    </div>
                </div>
                <form className='login-form' encType={!isRegistered&&"multipart/form-data"} onSubmit={isRegistered?sendLogin:sendRegister} >
                {!isRegistered?inputContainer([
                {
                    name:"fname",
                    placeHolder:"Enter your First Name",
                    value:register.fname,
                    reducer:setRegister,
                    callback:updateInput,
                    validate:validateRegister,
                    invalidValue:registerInvalid

                },
                {
                    name:"lname",
                    placeHolder:"Enter your Last Name",
                    value:register.lname,
                    reducer:setRegister,
                    callback:updateInput,
                    validate:validateRegister,
                    invalidValue:registerInvalid


                }, 
                {
                    name:"username",
                    placeHolder:"Choose a username",
                    value:register.username,
                    reducer:setRegister,
                    callback:updateInput,
                    validate:validateRegister,
                    invalidValue:registerInvalid


                },
                {
                    name:"email",
                    placeHolder:"Enter your Email",
                    value:register.email,
                    reducer:setRegister,
                    callback:updateInput,
                    validate:validateRegister,
                    invalidValue:registerInvalid

                }, 
                {
                    name:"password",
                    placeHolder:"Set a password",
                    value:register.password,
                    reducer:setRegister,
                    callback:updateInput,
                    validate:validateRegister,
                    invalidValue:registerInvalid


                },
                {
                    name:"confirmPassword",
                    placeHolder:"Confirm password",
                    value:register.confirmPassword,
                    reducer:setRegister,
                    callback:updateInput,
                    validate:validateRegister,
                    invalidValue:registerInvalid


                }
               
                ]):inputContainer([
                {
                    name:"username",
                    placeHolder:"Enter your username",
                    value:login.username,
                    reducer:setLogin,
                    callback:updateInput,
                    validate:validateLogin,
                    invalidValue:loginInvalid

                },
                {
                    name:"password",
                    placeHolder:"Enter your password",
                    value:login.password,
                    reducer:setLogin,
                    callback:updateInput,
                    validate:validateLogin,
                    invalidValue:loginInvalid

                }
            ])
            }
            {!isRegistered &&
                <label className='input-label'>
                    <p>Avatar</p>
                    <input type='file' required name='avatar' className='form-input' value={register.avatar} onChange={(e)=>setFile(e.target.files[0])}/>
                    <span>This is message for wrong and right</span>
                </label>}
                <label className='input-label' style={{"marginTop":"20px"}}>
                    <button className='form-input login-submit-button'>{isRegistered?"Login":"Register"}</button>
                </label>
                <p>Forgot password ?</p>
                </form>
                <div className='login-footer'>
                    <p>{isRegistered?"Not Registered ? Click ":"Already registered ? Click "}</p>
                    <span style={{cursor:"pointer"}} className='is-registered' onClick={()=>setIsRegistered(prev=>!prev)}>{isRegistered?"Register":"Login"}</span>
                </div>
            </div>
        </div>
        <ToastContainer/>
    </div>
  )
}

export default Login