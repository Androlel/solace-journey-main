/**
 * For displaying a list of friend requests
 */
import { View, Text, FlatList, RefreshControl, ScrollView, StyleSheet, Image } from 'react-native';
import FriendRequestItem from './FriendRequestItem/FriendRequestItem';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { curUser, ipAdandP } from '../../IPsAndOther';
import styles from './FriendRequestPageStyle';

const FriendRequestPage = () => {
  const [friendRequest, setFriendRequest] = useState([]);
  const [loading, setLoading] = useState();
  const [refreshing, setRefreshing] = useState(false);

  const updateFriendRequestList = (friendRequestAtIndex) => {
    console.log('This is update friend request list');
    console.log(friendRequestAtIndex);
    setFriendRequest((prevRequest) => {
      const updatedRequests = prevRequest.filter((_, index) => index !== friendRequestAtIndex);
      // Reassign IDs based on the new index
      updatedRequests.forEach((element, index) => {
        element.id = index;
      });
      return updatedRequests;
    });
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  // Get all the user friend requests from the DB
  const loadFriendRequests = () => {
    setRefreshing(true);
    setLoading(true);
    axios
      .get(`http://${ipAdandP}/friendrequests?receiver=${curUser.user}`)
      .then((response) => {
        const { data } = response;
        console.log('this is request page', data);
        // Append index for each element
        data.forEach((element, index) => {
          element.id = index;
        });
        setFriendRequest(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (refreshing) {
      console.log('Starting to refresh...');
      const timeoutId = setTimeout(() => {
        setRefreshing(false);
        console.log('Finished refreshing');
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [refreshing]);

  return loading ? (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFriendRequests} />}>
       <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View> 
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>
      <FlatList
        data={friendRequest}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friend requests yet!</Text>
            <Text style={styles.subText}>Pull down to refresh and see if new friend requests arrive.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <FriendRequestItem friendRequest={item} updateRequestList={updateFriendRequestList} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFriendRequests} />}
      />
    </View>
  );
};
export default FriendRequestPage