import Spinner from "./Spinner"

const FullPageSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <Spinner size="large" />
    </div>
  )
}

export default FullPageSpinner
