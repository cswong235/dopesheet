import { Container } from 'react-bootstrap';
import logo from './../assets/TheDopeSheet.png';

export default function Header(){
    return(
        <Container fluid className="align-items-center justify-content-center d-flex flex-column">
            <img src={logo} alt="The Dope Sheet logo"/>
            <Container fluid className="align-items=center justify-content-center d-flex">
                <h1>A grand selection of classics and hits.</h1>
            </Container>
            <h2></h2>
        </Container>
    )
}