import { createSlice } from "@reduxjs/toolkit";

const cartSlice=createSlice({
    name:"cart",
    initialState:{
        cart:[],
        cartNumber:0
    },
    reducers:{
        increment:(state,action)=>{
            state.cartNumber+=1
        },
        updateCartValue:(state,action)=>{
            state.cart.push(action.payload)
        }
    }
})


export const {increment, updateCartValue} = cartSlice.actions

export default cartSlice.reducer