from tensorflow.keras.models import load_model

model = load_model(
    "../models/model_long_term.keras",
    compile=False
)

print("INPUT :", model.input_shape)
print("OUTPUT:", model.output_shape)