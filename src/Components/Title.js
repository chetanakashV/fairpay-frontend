import './styles.css'

const Title = ({title, bar}) => {
    return(
        <>
            <div className={bar?"title-container-right":"title-container"}> {title} </div>
        </>
    )
}

export default Title; 