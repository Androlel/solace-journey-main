import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, TextInput, Button, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { curUser, ipAdandP } from '../IPsAndOther';
import styles from './MyCalendarStyle';

const MyCalendar = () => {
  const [items, setItems] = useState({});
  const username = curUser.user;
  
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', time: '', date: null });
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  

  const handleDayPress = (day) => {
    const formattedDate = day.dateString;
    setSelectedDate(formattedDate);
  };

  //Open a modal to add event
  const handleOpenModal = () => {
    if (selectedDate) {
      setNewEvent((prevEvent) => ({ ...prevEvent, date: new Date(selectedDate) }));
      setModalVisible(true);
    } else {
      alert('Please select a date from the calendar first!');
    }
  };

  //Function to grab all the events in the current month
  const fetchEvents = async (month) => {
   
    axios.get(`http://${ipAdandP}/calendar?user=${username}&month=${month}`).then(response => {
      const eventItems = response.data;
     const formattedItems = {};
    
      eventItems.forEach((event) => {
      const dateKey = event.date; // Use the DateYMD as the date key
      if (!formattedItems[dateKey]) {
        formattedItems[dateKey] = []; // Initialize the array if it doesn't exist
      }
      formattedItems[dateKey].push({ name: event.Name, time: event.time });
      });
      setItems(formattedItems);
       }).catch (error=> {
      console.error('Error fetching events:', error);
      alert('Failed to load events. Please try again later.');
    })
  };

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    console.log("this is the curr month",currentMonth)
    fetchEvents(currentMonth);
  }, []);

    const handleEditEvent = (date, event) => {
    setEventToEdit(event);
    setNewEvent({ name: event.name, time: event.time, date: new Date(date) });
    setEditMode(true);
    setModalVisible(true);
  };

  //Helper method to convert date and time to datetime object
  const combineDateAndTime = (date, time) => {
    const dateObj = new Date(date);
    const [timePart, modifier] = time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);

    let adjustedHours = hours;
    if (modifier === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      adjustedHours = 0;
    }

    dateObj.setUTCHours(adjustedHours);
    dateObj.setUTCMinutes(minutes);
    dateObj.setUTCSeconds(0);
console.log('finish!!!',dateObj)
    return dateObj;
  };

  const handleAddEvent = async () => {
    const regex = /^(([01]?[0-9]|2[0-3]):([0-5][0-9])\s(AM|PM))?$/i;
    if (!regex.test(newEvent.time)) {
      alert('Please input a time with the following format: 10:00 AM');
    } else {
      if (newEvent.name && newEvent.time && newEvent.date) {
        const eventDateTime = combineDateAndTime(newEvent.date, newEvent.time);
        if (editMode) {
          // Edit existing event
          axios
            .put(`http://${ipAdandP}/api/calendar/update`, {
              user: username,
              orgName: eventToEdit.name,
              newName: newEvent.name,
              orgDate: combineDateAndTime(selectedDate, eventToEdit.time).toISOString(),
              newDate: eventDateTime.toISOString(),
            })
            .then(() => {
              const dateKey = eventDateTime.toISOString().split('T')[0];
              setItems((prevItems) => {
                const updatedItems = { ...prevItems };
                updatedItems[selectedDate] = updatedItems[selectedDate].filter(
                  (e) => e.name !== eventToEdit.name || e.time !== eventToEdit.time
                );
                if (!updatedItems[dateKey]) {
                  updatedItems[dateKey] = [];
                }
                updatedItems[dateKey].push({ name: newEvent.name, time: newEvent.time });
                return updatedItems;
              });

              setModalVisible(false);
              setEditMode(false);
              setEventToEdit(null);
              setNewEvent({ name: '', time: '', date: null });
            })
            .catch((error) => {
              console.error('Error editing event:', error);
              alert('Failed to edit the event. Please try again later.');
            });
        } else {
          console.log("add event", eventDateTime)
          axios.post(`http://${ipAdandP}/api/calendar/add?user=${username}&name=${newEvent.name}&date=${eventDateTime.toISOString()}`)
            .then((response => {
              console.log('event added')
            const dateKey = eventDateTime.toISOString().split('T')[0];
          setItems((prevItems) => {
            const updatedItems = { ...prevItems };
            if (updatedItems[dateKey]) {
              updatedItems[dateKey].push({ name: newEvent.name, time: newEvent.time });
            } else {
              updatedItems[dateKey] = [{ name: newEvent.name, time: newEvent.time }];
            }
            return updatedItems;
          });

          setModalVisible(false);
          setNewEvent({ name: '', time: '', date: null });
          })).catch (error=> {
          console.error('Error adding event:', error);
          alert('Failed to add the event. Please try again later.');
        })}         
      } else {
        alert('Please fill in all fields!');
      }
    }
  };

  const handleRemoveEvent = async (date, eventName, time) => {
    const eventDateTime = combineDateAndTime(date, time);
    //Remove the T and Z in the date format
    const formattedString = eventDateTime.toISOString().replace("T", " ").replace("Z", "");
    console.log("remove event", formattedString)
      axios.delete(`http://${ipAdandP}/api/calendar/delete?user=${username}&name=${eventName}&date=${formattedString}`).
        then((response) =>
        {
          setItems((prevItems) => {
        const updatedItems = { ...prevItems };
        const dateKey = date;
        updatedItems[dateKey] = updatedItems[dateKey].filter(event => event.name !== eventName);
        if (updatedItems[dateKey].length === 0) {
          delete updatedItems[dateKey]; // Remove the date key if no events left
        }
        console.log("deleted", eventDateTime)
        return updatedItems;     
        });
      }).catch(error=> {
      console.error('Error removing event:', error);
      alert('Failed to remove the event. Please try again later.');
    })
  } 


  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No events for this day</Text>
      </View>
    );
  };

  const customTheme = {
    agendaDayTextColor: '#6b8e23',
    agendaDayNumColor: '#3a3a3a',
    agendaTodayColor: '#a8d5ba',
    agendaKnobColor: '#a8d5ba',
    calendarBackground: "#E0F2F1",
    dayTextColor: '#3a3a3a',
    textSectionTitleColor: "#6b8e23",
    textDayHeaderFontWeight: 'bold',
    textMonthFontWeight: 'bold',
    monthTextColor: '#2e8b57',
    selectedDayBackgroundColor: '#a8d5ba',
    selectedDayTextColor: '#2e8b57',
    textMonthFontSize: 16,
    textDayFontSize: 16,
    textDayHeaderFontSize: 14,
    agendaBackgroundColor: '#e2f4e7',
  };

  const formatDateToString = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <View style={{ flex: 2, marginHorizontal: 10, marginBottom: 20 }}>
      <Agenda
        items={items}
        showOnlySelectedDayItems={true}
        renderEmptyData={renderEmptyData}
        theme={customTheme}
        renderItem={(item) => (
          <View style={{ marginVertical: 10, backgroundColor: 'lightblue', padding: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.time}</Text>
          <View style={styles.pressable}>
             <Pressable onPress={() => handleEditEvent(selectedDate, item)} style={styles.editButton}>
              <AntDesign name="edit" size={18} color="blue" />
            </Pressable>
            
            <Pressable onPress={() => handleRemoveEvent(selectedDate, item.name, item.time)} style={styles.removeButton}>
              <AntDesign name="delete" size={18} color="red" />
              </Pressable>
            </View>
          </View>
        )}
        onDayPress={handleDayPress}
      />

      <Pressable style={styles.buttonContainer} onPress={handleOpenModal}>
        <AntDesign name="plus" size={24} color="white" />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editMode ? 'Edit Event' : 'Add Event'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Event Name"
              value={newEvent.name}
              onChangeText={(text) => setNewEvent({ ...newEvent, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Event Time (e.g., 10:00 AM)"
              value={newEvent.time}
              onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
            />

            <Text>Select Date: {newEvent.date ? formatDateToString(newEvent.date) : 'No date selected'}</Text>

            <View style={styles.addEventButton}>
              <Button title={editMode ? 'Update Event' : 'Add Event'} onPress={handleAddEvent} />
            </View>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyCalendar;
