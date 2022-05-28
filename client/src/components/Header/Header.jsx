
import { useSelector,useDispatch } from 'react-redux';
import "./../../styles/Header.css"
import HeaderLeft from './HeaderLeft';

function Header() {

  const user=useSelector((state)=>state.user.user)
  const dispatch=useDispatch()

  return (
    <div className="header bg-primary">
      <HeaderLeft/>
      
    </div>
  );
}

export default Header;