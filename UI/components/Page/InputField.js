/**
 * Input field for login and signup, and pop up modal
 **/

import React from 'react';
import { Text,StyleSheet, TextInput,View } from 'react-native';
import { Controller } from 'react-hook-form';

const InputText = ({ control, name, rules = {}, placeholder, top, secureEntry}) => {

  return (
      <Controller
          control ={control}
          name={name}
          rules= {rules}
          render={({ field: { value, onChange, onBlur }, fieldState:{error, isDirty}}) => (
          <>
              <View style={[styles.container, { marginTop: top },
              { borderColor: error ? 'red' : isDirty ? '#01922C' : 'e8e8e8' }]}>
              <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              style={[styles.input, {} ]}
              secureTextEntry ={secureEntry}
              />
            </View>
             {(error ) && (
              <Text style={{ color: 'red', paddingHorizontal: 55 }}>
                {error?.message || 'Unknown error'}
              </Text>
            )}
            </>
          ) }
        />
  );
};

/*
* Style for input field
*/
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: 50,
    width: "73%",
    alignSelf: 'center',

    borderColor: 'e8e8e8',
    borderWidth: 1.5,
    borderRadius: 5,

    paddingHorizontal: 10,
    marginVertical: 5
  },
  input: {
    paddingVertical: 9
  },
});

export default InputText;