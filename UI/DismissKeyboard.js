import { TouchableWithoutFeedback, Keyboard } from 'react-native'
const DismissKeyboard = ({children}) => (
    <TouchableWithoutFeedback
    onPress={Keyboard.dismiss} accessible={false}>
        {children}
    </TouchableWithoutFeedback>
);

export default DismissKeyboard