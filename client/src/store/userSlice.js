import {createSlice} from "@reduxjs/toolkit"

const userSlice=createSlice({
    initialState:{
        user:null
    },
    name:"user",
    reducers:{
        login:(state,action)=>{
            state.user=action.payload
        },

        logout:(state,action)=>{
            state.user=null
        }
    }
})

export  const getUser=(state)=>{
    return state.user.user
}
export const {logout,login}=userSlice.actions
export default userSlice.reducer

