const initialState = {
    currentActionTitle: "Home",

}

const coreReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_CURRENT_ACTION":
            state = {
                ...state,
                ...action.payload
            }
            break;
        case "RESET_CORE":
            state = initialState
            break;
        default:
            break;
    }

    return state
}

export default coreReducer;