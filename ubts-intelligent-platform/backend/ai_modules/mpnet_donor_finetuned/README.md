---
tags:
- sentence-transformers
- sentence-similarity
- feature-extraction
- generated_from_trainer
- dataset_size:8100
- loss:TripletLoss
base_model: sentence-transformers/all-mpnet-base-v2
widget:
- source_sentence: How do blood transfusion services collaborate with infectious disease
    experts and epidemiologists to monitor and respond to emerging pathogens and infectious
    disease outbreaks?
  sentences:
  - How do blood donation organizations collaborate with public health agencies, epidemiologists,
    and infectious disease experts to monitor and respond to emerging threats, outbreaks,
    or infectious diseases that may impact blood safety and availability?
  - Blood transfusion services participate in surveillance networks, share data with
    public health authorities, and implement screening protocols based on epidemiological
    data to mitigate the risk of transfusion-transmitted infections.
  - Religious diversity influences attitudes towards blood donation, with some religions
    endorsing it as a charitable act while others may have prohibitions or reservations,
    highlighting the need for culturally sensitive approaches in donor recruitment.
- source_sentence: How do demographic trends, such as aging populations or shifts
    in immigration patterns, impact blood donation rates?
  sentences:
  - Demographic trends, such as aging populations or shifts in immigration patterns,
    can impact blood donation rates by influencing the composition of donor populations,
    changing donation patterns over time, and necessitating adjustments in donor recruitment
    strategies to address evolving demographic needs and preferences.
  - How do demographic trends, such as aging populations or shifts in immigration
    patterns, impact blood donation rates?
  - Measures may include collaborating with medical experts and patient advocacy groups
    to develop tailored donation guidelines, providing specialized donor screening
    and counseling services, and ensuring comprehensive follow-up care and support
    for donors with rare blood disorders or genetic conditions.
- source_sentence: How does community-based marketing contribute to the prioritization
    of blood donation awareness campaigns and recruitment efforts?
  sentences:
  - Centers can partner with religious institutions to organize blood drives, host
    informational sessions, and incorporate donation messages into religious teachings,
    highlighting the importance of saving lives and helping those in need.
  - Community-based marketing contributes to the prioritization of blood donation
    awareness campaigns and recruitment efforts by tailoring messaging and outreach
    strategies to the specific needs, values, and preferences of local communities,
    thereby increasing the relevance and effectiveness of donation initiatives.
  - What role does community outreach play in promoting awareness of blood donation
    facilitation programs and recruiting potential donors?
- source_sentence: How do blood donation centers collaborate with other sectors such
    as education, industry, and tourism to expand donation opportunities and reach
    new donor demographics?
  sentences:
  - Blood donors are typically screened for transfusion-transmissible infections at
    each donation visit, with repeat testing performed periodically according to regulatory
    requirements and blood center policies.
  - How do blood donation centers collaborate with other sectors such as education,
    industry, and tourism to expand donation opportunities and reach new donor demographics?
  - Blood donation centers collaborate with other sectors such as education, industry,
    and tourism to expand donation opportunities and reach new donor demographics
    by partnering with schools and universities for donation events, engaging with
    businesses and employers to host workplace donation drives, and coordinating donation
    initiatives during tourist events and festivals.
- source_sentence: How can blood donation centers leverage data analytics to optimize
    appointment scheduling?
  sentences:
  - Blood donation organizations ensure the safety and quality of donated blood products
    by implementing strict screening protocols for donors, conducting thorough testing
    for infectious diseases, and employing standardized processing procedures to maintain
    product integrity.
  - Blood donation centers can use data analytics to analyze donor behavior, predict
    appointment demand, and optimize scheduling algorithms. By leveraging data insights,
    centers can improve appointment availability, reduce wait times, and enhance the
    overall donor experience.
  - How can blood donation centers leverage data analytics to optimize appointment
    scheduling?
pipeline_tag: sentence-similarity
library_name: sentence-transformers
---

# SentenceTransformer based on sentence-transformers/all-mpnet-base-v2

This is a [sentence-transformers](https://www.SBERT.net) model finetuned from [sentence-transformers/all-mpnet-base-v2](https://huggingface.co/sentence-transformers/all-mpnet-base-v2). It maps sentences & paragraphs to a 768-dimensional dense vector space and can be used for retrieval.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
- **Base model:** [sentence-transformers/all-mpnet-base-v2](https://huggingface.co/sentence-transformers/all-mpnet-base-v2) <!-- at revision e8c3b32edf5434bc2275fc9bab85f82640a19130 -->
- **Maximum Sequence Length:** 384 tokens
- **Output Dimensionality:** 768 dimensions
- **Similarity Function:** Cosine Similarity
- **Supported Modality:** Text
<!-- - **Training Dataset:** Unknown -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/huggingface/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): Transformer({'transformer_task': 'feature-extraction', 'modality_config': {'text': {'method': 'forward', 'method_output_name': 'last_hidden_state'}}, 'module_output_name': 'token_embeddings', 'architecture': 'MPNetModel'})
  (1): Pooling({'embedding_dimension': 768, 'pooling_mode': 'mean', 'include_prompt': True})
  (2): Normalize({})
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```
Then you can load this model and run inference.
```python
from sentence_transformers import SentenceTransformer

# Download from the 🤗 Hub
model = SentenceTransformer("sentence_transformers_model_id")
# Run inference
sentences = [
    'How can blood donation centers leverage data analytics to optimize appointment scheduling?',
    'Blood donation centers can use data analytics to analyze donor behavior, predict appointment demand, and optimize scheduling algorithms. By leveraging data insights, centers can improve appointment availability, reduce wait times, and enhance the overall donor experience.',
    'How can blood donation centers leverage data analytics to optimize appointment scheduling?',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 768]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[1.0000, 0.9992, 1.0000],
#         [0.9992, 1.0000, 0.9992],
#         [1.0000, 0.9992, 1.0000]])
```
<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Dataset

#### Unnamed Dataset

* Size: 8,100 training samples
* Columns: <code>sentence_0</code>, <code>sentence_1</code>, and <code>sentence_2</code>
* Approximate statistics based on the first 1000 samples:
  |         | sentence_0                                                                         | sentence_1                                                                          | sentence_2                                                                          |
  |:--------|:-----------------------------------------------------------------------------------|:------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------|
  | type    | string                                                                             | string                                                                              | string                                                                              |
  | details | <ul><li>min: 10 tokens</li><li>mean: 24.96 tokens</li><li>max: 67 tokens</li></ul> | <ul><li>min: 19 tokens</li><li>mean: 51.49 tokens</li><li>max: 168 tokens</li></ul> | <ul><li>min: 10 tokens</li><li>mean: 26.39 tokens</li><li>max: 129 tokens</li></ul> |
* Samples:
  | sentence_0                                                                                                                                                                                                   | sentence_1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | sentence_2                                                                                                                                                                                                   |
  |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>How can blood centers leverage donor loyalty programs and retention strategies within an online blood donation management system to cultivate long-term relationships and sustained engagement?</code> | <code>Blood centers can leverage donor loyalty programs and retention strategies within an online blood donation management system to cultivate long-term relationships and sustained engagement by offering incentives, rewards, or exclusive benefits for repeat donors, establishing personalized communication and recognition initiatives, and fostering a sense of belonging and commitment through targeted outreach and engagement efforts tailored to donor preferences and interests.</code> | <code>How can blood centers leverage donor loyalty programs and retention strategies within an online blood donation management system to cultivate long-term relationships and sustained engagement?</code> |
  | <code>What measures can blood donation centers take to ensure the security and confidentiality of donor information within appointment scheduling systems?</code>                                            | <code>Blood donation centers can ensure the security and confidentiality of donor information within appointment scheduling systems by implementing robust data encryption, access controls, and compliance with relevant privacy regulations such as HIPAA or GDPR.</code>                                                                                                                                                                                                                            | <code>How do blood donation centers ensure the confidentiality and privacy of donor information during the donation process?</code>                                                                          |
  | <code>How can partnerships with local businesses benefit blood donation campaigns?</code>                                                                                                                    | <code>Partnerships with local businesses benefit blood donation campaigns by providing resources, offering incentives, and promoting donation drives within their networks.</code>                                                                                                                                                                                                                                                                                                                     | <code>How can partnerships with local businesses benefit blood donation campaigns?</code>                                                                                                                    |
* Loss: [<code>TripletLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#tripletloss) with these parameters:
  ```json
  {
      "distance_metric": "TripletDistanceMetric.EUCLIDEAN",
      "triplet_margin": 5
  }
  ```

### Training Hyperparameters
#### Non-Default Hyperparameters

- `num_train_epochs`: 1
- `multi_dataset_batch_sampler`: round_robin

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `per_device_train_batch_size`: 8
- `num_train_epochs`: 1
- `max_steps`: -1
- `learning_rate`: 5e-05
- `lr_scheduler_type`: linear
- `lr_scheduler_kwargs`: None
- `warmup_steps`: 0
- `optim`: adamw_torch_fused
- `optim_args`: None
- `weight_decay`: 0.0
- `adam_beta1`: 0.9
- `adam_beta2`: 0.999
- `adam_epsilon`: 1e-08
- `optim_target_modules`: None
- `gradient_accumulation_steps`: 1
- `average_tokens_across_devices`: True
- `max_grad_norm`: 1
- `label_smoothing_factor`: 0.0
- `bf16`: False
- `fp16`: False
- `bf16_full_eval`: False
- `fp16_full_eval`: False
- `tf32`: None
- `gradient_checkpointing`: False
- `gradient_checkpointing_kwargs`: None
- `torch_compile`: False
- `torch_compile_backend`: None
- `torch_compile_mode`: None
- `use_liger_kernel`: False
- `liger_kernel_config`: None
- `use_cache`: False
- `neftune_noise_alpha`: None
- `torch_empty_cache_steps`: None
- `auto_find_batch_size`: False
- `log_on_each_node`: True
- `logging_nan_inf_filter`: True
- `include_num_input_tokens_seen`: no
- `log_level`: passive
- `log_level_replica`: warning
- `disable_tqdm`: False
- `project`: huggingface
- `trackio_space_id`: trackio
- `eval_strategy`: no
- `per_device_eval_batch_size`: 8
- `prediction_loss_only`: True
- `eval_on_start`: False
- `eval_do_concat_batches`: True
- `eval_use_gather_object`: False
- `eval_accumulation_steps`: None
- `include_for_metrics`: []
- `batch_eval_metrics`: False
- `save_only_model`: False
- `save_on_each_node`: False
- `enable_jit_checkpoint`: False
- `push_to_hub`: False
- `hub_private_repo`: None
- `hub_model_id`: None
- `hub_strategy`: every_save
- `hub_always_push`: False
- `hub_revision`: None
- `load_best_model_at_end`: False
- `ignore_data_skip`: False
- `restore_callback_states_from_checkpoint`: False
- `full_determinism`: False
- `seed`: 42
- `data_seed`: None
- `use_cpu`: False
- `accelerator_config`: {'split_batches': False, 'dispatch_batches': None, 'even_batches': True, 'use_seedable_sampler': True, 'non_blocking': False, 'gradient_accumulation_kwargs': None}
- `parallelism_config`: None
- `dataloader_drop_last`: False
- `dataloader_num_workers`: 0
- `dataloader_pin_memory`: True
- `dataloader_persistent_workers`: False
- `dataloader_prefetch_factor`: None
- `remove_unused_columns`: True
- `label_names`: None
- `train_sampling_strategy`: random
- `length_column_name`: length
- `ddp_find_unused_parameters`: None
- `ddp_bucket_cap_mb`: None
- `ddp_broadcast_buffers`: False
- `ddp_backend`: None
- `ddp_timeout`: 1800
- `fsdp`: []
- `fsdp_config`: {'min_num_params': 0, 'xla': False, 'xla_fsdp_v2': False, 'xla_fsdp_grad_ckpt': False}
- `deepspeed`: None
- `debug`: []
- `skip_memory_metrics`: True
- `do_predict`: False
- `resume_from_checkpoint`: None
- `warmup_ratio`: None
- `local_rank`: -1
- `prompts`: None
- `batch_sampler`: batch_sampler
- `multi_dataset_batch_sampler`: round_robin
- `router_mapping`: {}
- `learning_rate_mapping`: {}

</details>

### Training Logs
| Epoch  | Step | Training Loss |
|:------:|:----:|:-------------:|
| 0.4936 | 500  | 4.8026        |
| 0.9872 | 1000 | 4.6772        |


### Training Time
- **Training**: 1.9 hours

### Framework Versions
- Python: 3.14.3
- Sentence Transformers: 5.4.0
- Transformers: 5.5.3
- PyTorch: 2.11.0+cpu
- Accelerate: 1.13.0
- Datasets: 4.8.4
- Tokenizers: 0.22.2

## Citation

### BibTeX

#### Sentence Transformers
```bibtex
@inproceedings{reimers-2019-sentence-bert,
    title = "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    author = "Reimers, Nils and Gurevych, Iryna",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing",
    month = "11",
    year = "2019",
    publisher = "Association for Computational Linguistics",
    url = "https://arxiv.org/abs/1908.10084",
}
```

#### TripletLoss
```bibtex
@misc{hermans2017defense,
    title={In Defense of the Triplet Loss for Person Re-Identification},
    author={Alexander Hermans and Lucas Beyer and Bastian Leibe},
    year={2017},
    eprint={1703.07737},
    archivePrefix={arXiv},
    primaryClass={cs.CV}
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->