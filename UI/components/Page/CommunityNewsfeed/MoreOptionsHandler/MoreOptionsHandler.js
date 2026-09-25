import { Modal, View, TouchableOpacity, Text } from 'react-native';
import styles from './MoreOptionsHandlerStyle';

const MoreOptions = ({ onDelete, onReport, isCurrentUser, onAddFriend, isAdmin }) => {
  return (
    <View style={[styles.popover, { alignItems: 'flex-end' }]}>
      {/* Check if the user is the current user */}
      {isCurrentUser ? (
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.optionText}>Delete</Text>
        </TouchableOpacity>
      ) : (
                  // Stack the buttons vertically
        
        <View style={{ flexDirection: 'column'}}>
          <TouchableOpacity onPress={onReport}>
            <Text style={styles.optionText}>Report</Text>
          </TouchableOpacity>
        {isAdmin && <TouchableOpacity onPress={onAddFriend} style={{ marginTop: 8 }}>
            <Text style={styles.optionText}>Add Friend</Text>
        </TouchableOpacity>}
        </View>
      )}
    </View>
  );
};

export default MoreOptions;
