import React from 'react'
import SearchIcon from "@mui/icons-material/Search";
import { Avatar } from "@mui/material";
import { useState } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function HeaderLeft() {

    const [userMenu,setUserMenu]=useState(false)
    return (
    <div className="header_left">
        <img className="app_logo" src="/logo.png" alt="app-logo" />
        {/* mat icon */}
        <div className="header_inputs">
          <div className="header_search">
            <div>
                <SearchIcon sx={{width:"25px",height:"25px"}} />
            </div>
            <div className='input_suggestion'>
                <input type="text" placeholder="Search for people, jobs, more" defaultValue={""} />
                <div className='suggestions'>
                </div>
            </div>
            
          <div className='avatar_nav'>
            <div className='flex flex-row'>
                <button type="button" id="dropdownDefault" data-dropdown-toggle="dropdown">
                    {/* <Avatar className="user_avatar" sx={{width:"25px",height:"25px"}} /> */}
                    Click
                </button>
                <ul className='avatar_dropdown' id="dropdown" aria-labelledby="dropdownDefault">
                    <li>Hello 1</li>
                    <li>Hello 1</li>
                    <li>Hello 1</li>
                </ul> 
                <ShoppingCartIcon className='text-gray-500 ml-5'/>
                
                 
            </div>

            
          </div>
            
          </div>
        </div>
      </div>
  )
}

export default HeaderLeft